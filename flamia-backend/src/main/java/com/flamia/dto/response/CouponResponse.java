package com.flamia.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CouponResponse {
    private String code;
    private String type;
    private BigDecimal value;
    private BigDecimal discountAmount;
    private BigDecimal minimumOrderValue;
    private String description;
}
