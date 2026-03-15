package com.flamia.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {
    private UUID id;
    private String orderNumber;
    private BigDecimal subtotal;
    private BigDecimal discount;
    private BigDecimal total;
    private String status;
    private String trackingId;
    private String couponCode;
    private String notes;
    private List<OrderItemResponse> items;
    private Map<String, Object> address;
    private PaymentResponse payment;
    private Integer itemCount;
    private String primaryProductImage;
    private String customerPhone;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
