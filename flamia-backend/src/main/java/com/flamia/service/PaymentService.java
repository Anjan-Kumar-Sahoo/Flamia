package com.flamia.service;

import com.flamia.dto.request.RazorpayVerifyRequest;
import com.flamia.dto.request.UpiSubmitRequest;
import com.flamia.dto.response.PaymentResponse;
import com.flamia.entity.Order;
import com.flamia.entity.Payment;
import com.flamia.enums.OrderStatus;
import com.flamia.enums.PaymentMethod;
import com.flamia.enums.PaymentStatus;
import com.flamia.exception.BusinessRuleException;
import com.flamia.exception.ForbiddenException;
import com.flamia.exception.ResourceNotFoundException;
import com.flamia.repository.OrderRepository;
import com.flamia.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;

    @Value("${flamia.razorpay.key-id}")
    private String razorpayKeyId;

    @Value("${flamia.razorpay.key-secret}")
    private String razorpayKeySecret;

    // ── Razorpay Create Order ─────────────────────────

    @Transactional
    public PaymentResponse createRazorpayOrder(UUID userId, UUID orderId) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new ForbiddenException("Order not found or does not belong to you"));

        if (order.getPayment() != null && order.getPayment().getStatus() == PaymentStatus.PAID) {
            throw new BusinessRuleException("Order is already paid");
        }

        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new BusinessRuleException("Cannot pay for a cancelled order");
        }

        // Create payment record
        Payment payment = Payment.builder()
                .order(order)
                .method(PaymentMethod.RAZORPAY)
                .status(PaymentStatus.PENDING)
                .amount(order.getTotal())
                .razorpayOrderId("order_" + UUID.randomUUID().toString().substring(0, 14))
                .build();

        payment = paymentRepository.save(payment);

        log.info("Razorpay order created: orderId={}, amount={}", orderId, order.getTotal());

        return PaymentResponse.builder()
                .id(payment.getId())
                .orderId(order.getId())
                .orderNumber(order.getOrderNumber())
                .razorpayOrderId(payment.getRazorpayOrderId())
                .razorpayKeyId(razorpayKeyId)
                .amount(order.getTotal())
                .method(PaymentMethod.RAZORPAY.name())
                .status(PaymentStatus.PENDING.name())
                .build();
    }

    // ── Razorpay Verify Payment ───────────────────────

    @Transactional
    public PaymentResponse verifyRazorpayPayment(UUID userId, RazorpayVerifyRequest request) {
        Order order = orderRepository.findByIdAndUserId(request.getOrderId(), userId)
                .orElseThrow(() -> new ForbiddenException("Order not found or does not belong to you"));

        Payment payment = paymentRepository.findByOrderId(order.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "orderId", order.getId()));

        // Verify signature
        String payload = request.getRazorpayOrderId() + "|" + request.getRazorpayPaymentId();
        boolean signatureValid = verifySignature(payload, request.getRazorpaySignature(), razorpayKeySecret);

        if (!signatureValid) {
            payment.setStatus(PaymentStatus.FAILED);
            paymentRepository.save(payment);
            throw new BusinessRuleException("Payment signature verification failed");
        }

        // Mark payment as PAID
        payment.setStatus(PaymentStatus.PAID);
        payment.setRazorpayPaymentId(request.getRazorpayPaymentId());
        payment.setRazorpaySignature(request.getRazorpaySignature());
        paymentRepository.save(payment);

        // Move order to CONFIRMED
        order.setStatus(OrderStatus.CONFIRMED);
        orderRepository.save(order);

        log.info("Razorpay payment verified: orderId={}, paymentId={}",
                order.getId(), request.getRazorpayPaymentId());

        return PaymentResponse.builder()
                .id(payment.getId())
                .orderId(order.getId())
                .orderNumber(order.getOrderNumber())
                .method(PaymentMethod.RAZORPAY.name())
                .status(PaymentStatus.PAID.name())
                .amount(payment.getAmount())
                .createdAt(payment.getCreatedAt())
                .build();
    }

    // ── UPI Manual Submit ─────────────────────────────

    @Transactional
    public PaymentResponse submitUpiPayment(UUID userId, UpiSubmitRequest request) {
        Order order = orderRepository.findByIdAndUserId(request.getOrderId(), userId)
                .orElseThrow(() -> new ForbiddenException("Order not found or does not belong to you"));

        if (order.getPayment() != null && order.getPayment().getStatus() == PaymentStatus.PAID) {
            throw new BusinessRuleException("Order is already paid");
        }

        Payment payment = Payment.builder()
                .order(order)
                .method(PaymentMethod.UPI_MANUAL)
                .status(PaymentStatus.PENDING)
                .amount(order.getTotal())
                .utrNumber(request.getUtrNumber())
                .screenshotUrl(request.getScreenshotUrl())
                .build();

        payment = paymentRepository.save(payment);

        log.info("UPI payment submitted: orderId={}, utr={}", order.getId(), request.getUtrNumber());

        return PaymentResponse.builder()
                .id(payment.getId())
                .orderId(order.getId())
                .method(PaymentMethod.UPI_MANUAL.name())
                .status(PaymentStatus.PENDING.name())
                .amount(payment.getAmount())
                .build();
    }

    // ── Admin: Verify UPI Payment ─────────────────────

    @Transactional
    public void verifyUpiPayment(UUID paymentId, boolean approved, String remarks) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "id", paymentId));

        if (payment.getMethod() != PaymentMethod.UPI_MANUAL) {
            throw new BusinessRuleException("Only UPI manual payments can be verified");
        }
        if (payment.getStatus() != PaymentStatus.PENDING) {
            throw new BusinessRuleException("Payment is not pending verification");
        }

        Order order = payment.getOrder();

        if (approved) {
            payment.setStatus(PaymentStatus.PAID);
            payment.setRemarks(remarks);
            paymentRepository.save(payment);

            order.setStatus(OrderStatus.CONFIRMED);
            orderRepository.save(order);

            log.info("UPI payment approved: paymentId={}, orderId={}", paymentId, order.getId());
        } else {
            payment.setStatus(PaymentStatus.FAILED);
            payment.setRemarks(remarks);
            paymentRepository.save(payment);

            log.info("UPI payment rejected: paymentId={}, reason={}", paymentId, remarks);
        }
    }

    // ── Utility ───────────────────────────────────────

    private boolean verifySignature(String payload, String signature, String secret) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(), "HmacSHA256"));
            byte[] hash = mac.doFinal(payload.getBytes());
            String computed = bytesToHex(hash);
            return computed.equals(signature);
        } catch (Exception e) {
            log.error("Signature verification error", e);
            return false;
        }
    }

    private String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
}
