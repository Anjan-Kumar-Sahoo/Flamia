package com.flamia.service;

import com.flamia.dto.request.ValidateCouponRequest;
import com.flamia.dto.response.CouponResponse;
import com.flamia.entity.Coupon;
import com.flamia.exception.BusinessRuleException;
import com.flamia.repository.CouponRepository;
import com.flamia.repository.CouponUsageRepository;
import com.flamia.util.PriceCalculator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CouponService {

    private final CouponRepository couponRepository;
    private final CouponUsageRepository couponUsageRepository;

    @Transactional(readOnly = true)
    public CouponResponse validateCoupon(UUID userId, ValidateCouponRequest request) {
        Coupon coupon = couponRepository.findByCodeIgnoreCase(request.getCode().trim())
                .orElseThrow(() -> new BusinessRuleException("Coupon not found"));

        if (!coupon.isValid()) {
            throw new BusinessRuleException("Coupon is expired or inactive");
        }

        if (coupon.getMinimumOrderValue() != null &&
            request.getOrderSubtotal().compareTo(coupon.getMinimumOrderValue()) < 0) {
            throw new BusinessRuleException(
                "Minimum order value of ₹" + coupon.getMinimumOrderValue() + " required");
        }

        long userUsage = couponUsageRepository.countByCouponIdAndUserId(coupon.getId(), userId);
        if (userUsage >= coupon.getPerUserLimit()) {
            throw new BusinessRuleException("You have already used this coupon");
        }

        BigDecimal discountAmount = PriceCalculator.calculateDiscount(
                request.getOrderSubtotal(), coupon.getType(),
                coupon.getValue(), coupon.getMaximumDiscount());

        return CouponResponse.builder()
                .code(coupon.getCode())
                .type(coupon.getType().name())
                .value(coupon.getValue())
                .discountAmount(discountAmount)
                .minimumOrderValue(coupon.getMinimumOrderValue())
                .description(coupon.getDescription())
                .build();
    }
}
