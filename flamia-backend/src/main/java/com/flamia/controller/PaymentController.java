package com.flamia.controller;

import com.flamia.dto.request.RazorpayVerifyRequest;
import com.flamia.dto.request.UpiSubmitRequest;
import com.flamia.dto.request.ValidateCouponRequest;
import com.flamia.dto.response.ApiResponse;
import com.flamia.dto.response.CouponResponse;
import com.flamia.dto.response.PaymentResponse;
import com.flamia.security.UserPrincipal;
import com.flamia.service.CouponService;
import com.flamia.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final CouponService couponService;

    @PostMapping("/razorpay/create/{orderId}")
    public ResponseEntity<ApiResponse<PaymentResponse>> createRazorpayOrder(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID orderId) {
        PaymentResponse payment = paymentService.createRazorpayOrder(principal.getUserId(), orderId);
        return ResponseEntity.ok(ApiResponse.success(payment));
    }

    @PostMapping("/razorpay/verify")
    public ResponseEntity<ApiResponse<PaymentResponse>> verifyRazorpayPayment(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody RazorpayVerifyRequest request) {
        PaymentResponse payment = paymentService.verifyRazorpayPayment(principal.getUserId(), request);
        return ResponseEntity.ok(ApiResponse.success("Payment verified", payment));
    }

    @PostMapping("/upi/submit")
    public ResponseEntity<ApiResponse<PaymentResponse>> submitUpiPayment(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody UpiSubmitRequest request) {
        PaymentResponse payment = paymentService.submitUpiPayment(principal.getUserId(), request);
        return ResponseEntity.ok(ApiResponse.success("UPI payment submitted for review", payment));
    }

    @PostMapping("/coupon/validate")
    public ResponseEntity<ApiResponse<CouponResponse>> validateCoupon(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ValidateCouponRequest request) {
        CouponResponse coupon = couponService.validateCoupon(principal.getUserId(), request);
        return ResponseEntity.ok(ApiResponse.success(coupon));
    }
}
