package com.flamia.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {
    private UUID id;
    private UUID orderId;
    private String orderNumber;
    private String method;
    private String status;
    private BigDecimal amount;
    private String razorpayOrderId;
    private String razorpayKeyId;
    private String utrNumber;
    private String screenshotUrl;
    private String remarks;
    private LocalDateTime createdAt;
}
