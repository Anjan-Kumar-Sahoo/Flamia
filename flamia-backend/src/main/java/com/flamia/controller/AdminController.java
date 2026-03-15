package com.flamia.controller;

import com.flamia.dto.request.CreateCouponRequest;
import com.flamia.dto.response.*;
import com.flamia.entity.Coupon;
import com.flamia.enums.*;
import com.flamia.exception.BadRequestException;
import com.flamia.exception.DuplicateResourceException;
import com.flamia.exception.ResourceNotFoundException;
import com.flamia.repository.*;
import com.flamia.service.OrderService;
import com.flamia.service.PaymentService;
import com.flamia.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final OrderService orderService;
    private final PaymentService paymentService;
    private final ReviewService reviewService;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final PaymentRepository paymentRepository;
    private final CouponRepository couponRepository;

    // ── Dashboard ─────────────────────────────────────

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboard() {
        LocalDateTime today = LocalDate.now().atStartOfDay();
        LocalDateTime weekAgo = today.minusDays(7);
        LocalDateTime monthAgo = today.minusDays(30);

        Map<String, Long> ordersByStatus = new LinkedHashMap<>();
        for (OrderStatus status : OrderStatus.values()) {
            ordersByStatus.put(status.name(), orderRepository.countByStatus(status));
        }

        long pendingUpi = paymentRepository.countByMethodAndStatus(
                PaymentMethod.UPI_MANUAL, PaymentStatus.PENDING);

        List<OrderResponse> recentOrders = orderRepository.findRecentOrders(PageRequest.of(0, 5)).stream()
                .map(order -> OrderResponse.builder()
                        .id(order.getId())
                        .orderNumber(order.getOrderNumber())
                        .total(order.getTotal())
                        .status(order.getStatus().name())
                        .customerPhone(order.getUser().getPhone())
                        .createdAt(order.getCreatedAt())
                        .build())
                .toList();

        DashboardResponse dashboard = DashboardResponse.builder()
                .totalOrders(orderRepository.count())
                .ordersByStatus(ordersByStatus)
                .revenueToday(orderRepository.calculateRevenueSince(today))
                .revenueThisWeek(orderRepository.calculateRevenueSince(weekAgo))
                .revenueThisMonth(orderRepository.calculateRevenueSince(monthAgo))
                .pendingUpiVerifications(pendingUpi)
                .totalCustomers(userRepository.count())
                .totalProducts(productRepository.countByIsActiveTrue())
                .recentOrders(recentOrders)
                .build();

        return ResponseEntity.ok(ApiResponse.success(dashboard));
    }

    // ── Admin Orders ──────────────────────────────────

    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<PagedResponse<OrderResponse>>> getOrders(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PagedResponse<OrderResponse> orders = orderService.getAdminOrders(status, page, size);
        return ResponseEntity.ok(ApiResponse.success(orders));
    }

    @GetMapping("/orders/{orderId}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrder(@PathVariable UUID orderId) {
        OrderResponse order = orderService.getAdminOrderDetail(orderId);
        return ResponseEntity.ok(ApiResponse.success(order));
    }

    @PutMapping("/orders/{orderId}/status")
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrderStatus(
            @PathVariable UUID orderId,
            @RequestBody Map<String, String> body) {
        String newStatus = body.get("status");
        if (newStatus == null) throw new BadRequestException("Status field required");
        OrderResponse order = orderService.updateOrderStatus(orderId, newStatus);
        return ResponseEntity.ok(ApiResponse.success("Status updated", order));
    }

    @PutMapping("/orders/{orderId}/tracking")
    public ResponseEntity<ApiResponse<Void>> updateTracking(
            @PathVariable UUID orderId,
            @RequestBody Map<String, String> body) {
        String trackingId = body.get("trackingId");
        if (trackingId == null) throw new BadRequestException("Tracking ID required");
        orderService.updateTrackingId(orderId, trackingId);
        return ResponseEntity.ok(ApiResponse.success("Tracking ID added"));
    }

    // ── Admin Payments ────────────────────────────────

    @PutMapping("/payments/{paymentId}/verify")
    public ResponseEntity<ApiResponse<Void>> verifyUpiPayment(
            @PathVariable UUID paymentId,
            @RequestBody Map<String, Object> body) {
        boolean approved = Boolean.TRUE.equals(body.get("approved"));
        String remarks = (String) body.getOrDefault("remarks", "");
        paymentService.verifyUpiPayment(paymentId, approved, remarks);
        return ResponseEntity.ok(ApiResponse.success(approved ? "Payment approved" : "Payment rejected"));
    }

    // ── Admin Reviews ─────────────────────────────────

    @DeleteMapping("/reviews/{reviewId}")
    public ResponseEntity<Void> deleteReview(@PathVariable UUID reviewId) {
        reviewService.adminDeleteReview(reviewId);
        return ResponseEntity.noContent().build();
    }

    // ── Admin Coupons ─────────────────────────────────

    @PostMapping("/coupons")
    public ResponseEntity<ApiResponse<Void>> createCoupon(
            @Valid @RequestBody CreateCouponRequest request) {
        if (couponRepository.existsByCodeIgnoreCase(request.getCode())) {
            throw new DuplicateResourceException("Coupon with code '" + request.getCode() + "' already exists");
        }

        CouponType couponType;
        try {
            couponType = CouponType.valueOf(request.getType().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid coupon type: " + request.getType());
        }

        Coupon coupon = Coupon.builder()
                .code(request.getCode().toUpperCase())
                .description(request.getDescription())
                .type(couponType)
                .value(request.getValue())
                .minimumOrderValue(request.getMinimumOrderValue())
                .maximumDiscount(request.getMaximumDiscount())
                .usageLimit(request.getUsageLimit())
                .perUserLimit(request.getPerUserLimit() != null ? request.getPerUserLimit() : 1)
                .status(CouponStatus.ACTIVE)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .build();

        couponRepository.save(coupon);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Coupon created"));
    }
}
