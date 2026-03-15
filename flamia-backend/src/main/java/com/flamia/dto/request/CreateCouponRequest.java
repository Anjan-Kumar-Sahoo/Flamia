package com.flamia.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class CreateCouponRequest {

    @NotBlank(message = "Coupon code is required")
    @Size(max = 20, message = "Code must not exceed 20 characters")
    private String code;

    @Size(max = 255, message = "Description must not exceed 255 characters")
    private String description;

    @NotBlank(message = "Coupon type is required")
    private String type;

    @NotNull(message = "Value is required")
    @DecimalMin(value = "0.01", message = "Value must be greater than 0")
    private BigDecimal value;

    private BigDecimal minimumOrderValue;
    private BigDecimal maximumDiscount;
    private Integer usageLimit;
    private Integer perUserLimit;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
}
