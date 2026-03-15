package com.flamia.controller;

import com.flamia.dto.request.CreateOrderRequest;
import com.flamia.dto.response.ApiResponse;
import com.flamia.dto.response.OrderResponse;
import com.flamia.dto.response.PagedResponse;
import com.flamia.security.UserPrincipal;
import com.flamia.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateOrderRequest request) {
        OrderResponse order = orderService.createOrder(principal.getUserId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Order placed successfully", order));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<OrderResponse>>> getOrders(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<OrderResponse> orders = orderService.getUserOrders(
                principal.getUserId(), page, size);
        return ResponseEntity.ok(ApiResponse.success(orders));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrder(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID orderId) {
        OrderResponse order = orderService.getUserOrderDetail(principal.getUserId(), orderId);
        return ResponseEntity.ok(ApiResponse.success(order));
    }
}
