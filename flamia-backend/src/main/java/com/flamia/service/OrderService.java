package com.flamia.service;

import com.flamia.dto.request.CreateOrderRequest;
import com.flamia.dto.response.*;
import com.flamia.entity.*;
import com.flamia.enums.OrderStatus;
import com.flamia.exception.BadRequestException;
import com.flamia.exception.BusinessRuleException;
import com.flamia.exception.ForbiddenException;
import com.flamia.exception.ResourceNotFoundException;
import com.flamia.repository.*;
import com.flamia.util.OrderIdGenerator;
import com.flamia.util.PriceCalculator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final AddressRepository addressRepository;
    private final CouponRepository couponRepository;
    private final CouponUsageRepository couponUsageRepository;
    private final UserRepository userRepository;
    private final OrderIdGenerator orderIdGenerator;

    @Transactional
    public OrderResponse createOrder(UUID userId, CreateOrderRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // Validate address ownership
        Address address = addressRepository.findByIdAndUserId(request.getAddressId(), userId)
                .orElseThrow(() -> new ForbiddenException("Address does not belong to you"));

        // Build order items and validate stock + prices
        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;

        for (CreateOrderRequest.OrderItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", "id", itemReq.getProductId()));

            if (!product.getIsActive()) {
                throw new BusinessRuleException("Product '" + product.getName() + "' is no longer available");
            }

            // Price verification — prevent stale cart submissions
            if (product.getPrice().compareTo(itemReq.getUnitPrice()) != 0) {
                throw new BadRequestException(
                    "Price mismatch for '" + product.getName() + "'. Expected " +
                    product.getPrice() + ", got " + itemReq.getUnitPrice());
            }

            // Stock check
            if (product.getStockQuantity() < itemReq.getQuantity()) {
                throw new BusinessRuleException(
                    "Insufficient stock for '" + product.getName() + "'. Available: " + product.getStockQuantity());
            }

            // Decrement stock
            product.decrementStock(itemReq.getQuantity());
            productRepository.save(product);

            // Snapshot product data into order item
            String primaryImage = product.getImages().stream()
                    .filter(ProductImage::getIsPrimary)
                    .findFirst()
                    .map(ProductImage::getUrl)
                    .orElse(product.getImages().isEmpty() ? null : product.getImages().get(0).getUrl());

            BigDecimal itemTotal = PriceCalculator.calculateItemTotal(product.getPrice(), itemReq.getQuantity());

            OrderItem item = OrderItem.builder()
                    .product(product)
                    .productName(product.getName())
                    .productImage(primaryImage)
                    .quantity(itemReq.getQuantity())
                    .unitPrice(product.getPrice())
                    .totalPrice(itemTotal)
                    .build();

            orderItems.add(item);
            subtotal = subtotal.add(itemTotal);
        }

        // Apply coupon if provided
        BigDecimal discount = BigDecimal.ZERO;
        String couponCode = null;
        Coupon coupon = null;

        if (request.getCouponCode() != null && !request.getCouponCode().isBlank()) {
            coupon = couponRepository.findByCodeIgnoreCase(request.getCouponCode().trim())
                    .orElseThrow(() -> new BusinessRuleException("Invalid coupon code"));

            if (!coupon.isValid()) {
                throw new BusinessRuleException("Coupon is expired or no longer active");
            }

            if (coupon.getMinimumOrderValue() != null &&
                subtotal.compareTo(coupon.getMinimumOrderValue()) < 0) {
                throw new BusinessRuleException(
                    "Minimum order value of ₹" + coupon.getMinimumOrderValue() + " required for this coupon");
            }

            long userUsage = couponUsageRepository.countByCouponIdAndUserId(coupon.getId(), userId);
            if (userUsage >= coupon.getPerUserLimit()) {
                throw new BusinessRuleException("You have already used this coupon");
            }

            discount = PriceCalculator.calculateDiscount(
                    subtotal, coupon.getType(), coupon.getValue(), coupon.getMaximumDiscount());
            couponCode = coupon.getCode();
        }

        BigDecimal total = PriceCalculator.calculateTotal(subtotal, discount);

        // Snapshot address to JSON
        Map<String, Object> addressJson = new LinkedHashMap<>();
        addressJson.put("fullName", address.getFullName());
        addressJson.put("phone", address.getPhone());
        addressJson.put("addressLine1", address.getAddressLine1());
        addressJson.put("addressLine2", address.getAddressLine2());
        addressJson.put("city", address.getCity());
        addressJson.put("state", address.getState());
        addressJson.put("pincode", address.getPincode());

        // Create order
        Order order = Order.builder()
                .orderNumber(orderIdGenerator.generateOrderId())
                .user(user)
                .status(OrderStatus.PLACED)
                .subtotal(subtotal)
                .discount(discount)
                .total(total)
                .couponCode(couponCode)
                .addressJson(addressJson)
                .notes(request.getNotes())
                .build();

        for (OrderItem item : orderItems) {
            order.addItem(item);
        }

        order = orderRepository.save(order);

        // Record coupon usage
        if (coupon != null) {
            coupon.incrementUsage();
            couponRepository.save(coupon);

            CouponUsage usage = CouponUsage.builder()
                    .coupon(coupon)
                    .user(user)
                    .order(order)
                    .build();
            couponUsageRepository.save(usage);
        }

        log.info("Order created: orderNumber={}, userId={}, total={}",
                order.getOrderNumber(), userId, total);

        return toDetailResponse(order);
    }

    @Transactional(readOnly = true)
    public PagedResponse<OrderResponse> getUserOrders(UUID userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, Math.min(size, 50));
        Page<Order> orderPage = orderRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);

        List<OrderResponse> content = orderPage.getContent().stream()
                .map(this::toListResponse)
                .toList();

        return PagedResponse.of(content, orderPage.getNumber(),
                orderPage.getSize(), orderPage.getTotalElements(),
                orderPage.getTotalPages(), orderPage.isLast());
    }

    @Transactional(readOnly = true)
    public OrderResponse getUserOrderDetail(UUID userId, UUID orderId) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new ForbiddenException("Order not found or does not belong to you"));
        return toDetailResponse(order);
    }

    // ── Admin ─────────────────────────────────────────

    @Transactional(readOnly = true)
    public PagedResponse<OrderResponse> getAdminOrders(String status, int page, int size) {
        Pageable pageable = PageRequest.of(page, Math.min(size, 50));
        OrderStatus orderStatus = null;
        if (status != null && !status.isBlank()) {
            try {
                orderStatus = OrderStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException ignored) {}
        }

        Page<Order> orderPage = orderRepository.findAllWithStatusFilter(orderStatus, pageable);

        List<OrderResponse> content = orderPage.getContent().stream()
                .map(this::toAdminResponse)
                .toList();

        return PagedResponse.of(content, orderPage.getNumber(),
                orderPage.getSize(), orderPage.getTotalElements(),
                orderPage.getTotalPages(), orderPage.isLast());
    }

    @Transactional(readOnly = true)
    public OrderResponse getAdminOrderDetail(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));
        return toAdminResponse(order);
    }

    @Transactional
    public OrderResponse updateOrderStatus(UUID orderId, String newStatusStr) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        OrderStatus newStatus;
        try {
            newStatus = OrderStatus.valueOf(newStatusStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid status: " + newStatusStr);
        }

        if (!order.canTransitionTo(newStatus)) {
            throw new BusinessRuleException(
                "Cannot transition from " + order.getStatus() + " to " + newStatus);
        }

        // Restore stock on cancellation
        if (newStatus == OrderStatus.CANCELLED) {
            for (OrderItem item : order.getItems()) {
                Product product = item.getProduct();
                product.incrementStock(item.getQuantity());
                productRepository.save(product);
            }
        }

        order.setStatus(newStatus);
        order = orderRepository.save(order);

        log.info("Order status updated: orderNumber={}, {} -> {}",
                order.getOrderNumber(), order.getStatus(), newStatus);

        return toDetailResponse(order);
    }

    @Transactional
    public void updateTrackingId(UUID orderId, String trackingId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        if (order.getStatus() != OrderStatus.SHIPPED && order.getStatus() != OrderStatus.DELIVERED) {
            throw new BusinessRuleException("Tracking ID can only be added to SHIPPED or DELIVERED orders");
        }

        order.setTrackingId(trackingId);
        orderRepository.save(order);
        log.info("Tracking ID added: orderNumber={}, trackingId={}", order.getOrderNumber(), trackingId);
    }

    // ── Mapping ───────────────────────────────────────

    private OrderResponse toListResponse(Order order) {
        String primaryImage = order.getItems().isEmpty() ? null : order.getItems().get(0).getProductImage();
        return OrderResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .total(order.getTotal())
                .status(order.getStatus().name())
                .itemCount(order.getItems().size())
                .primaryProductImage(primaryImage)
                .createdAt(order.getCreatedAt())
                .build();
    }

    private OrderResponse toDetailResponse(Order order) {
        List<OrderItemResponse> items = order.getItems().stream()
                .map(item -> OrderItemResponse.builder()
                        .productId(item.getProduct().getId())
                        .productName(item.getProductName())
                        .productImage(item.getProductImage())
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .totalPrice(item.getTotalPrice())
                        .build())
                .toList();

        PaymentResponse paymentResp = null;
        if (order.getPayment() != null) {
            Payment payment = order.getPayment();
            paymentResp = PaymentResponse.builder()
                    .id(payment.getId())
                    .method(payment.getMethod().name())
                    .status(payment.getStatus().name())
                    .amount(payment.getAmount())
                    .createdAt(payment.getCreatedAt())
                    .build();
        }

        return OrderResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .subtotal(order.getSubtotal())
                .discount(order.getDiscount())
                .total(order.getTotal())
                .status(order.getStatus().name())
                .trackingId(order.getTrackingId())
                .couponCode(order.getCouponCode())
                .notes(order.getNotes())
                .items(items)
                .address(order.getAddressJson())
                .payment(paymentResp)
                .itemCount(order.getItems().size())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }

    private OrderResponse toAdminResponse(Order order) {
        OrderResponse response = toDetailResponse(order);
        response.setCustomerPhone(order.getUser().getPhone());
        return response;
    }
}
