package com.flamia.util;

import com.flamia.enums.CouponType;

import java.math.BigDecimal;
import java.math.RoundingMode;

public class PriceCalculator {

    private PriceCalculator() {}

    /**
     * Calculates the discount amount for a coupon.
     *
     * @param subtotal      Order subtotal
     * @param couponType    PERCENTAGE or FIXED_AMOUNT
     * @param couponValue   Coupon value (percentage or fixed amount)
     * @param maximumDiscount Maximum cap for percentage discounts (nullable)
     * @return Discount amount (never exceeds subtotal)
     */
    public static BigDecimal calculateDiscount(BigDecimal subtotal,
                                                CouponType couponType,
                                                BigDecimal couponValue,
                                                BigDecimal maximumDiscount) {
        BigDecimal discount;

        if (couponType == CouponType.PERCENTAGE) {
            discount = subtotal.multiply(couponValue)
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

            // Apply maximum discount cap
            if (maximumDiscount != null && discount.compareTo(maximumDiscount) > 0) {
                discount = maximumDiscount;
            }
        } else {
            // FIXED_AMOUNT
            discount = couponValue;
        }

        // Discount cannot exceed subtotal
        if (discount.compareTo(subtotal) > 0) {
            discount = subtotal;
        }

        return discount.setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Calculates the total after discount.
     */
    public static BigDecimal calculateTotal(BigDecimal subtotal, BigDecimal discount) {
        return subtotal.subtract(discount).setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Calculates item total (unitPrice × quantity).
     */
    public static BigDecimal calculateItemTotal(BigDecimal unitPrice, int quantity) {
        return unitPrice.multiply(BigDecimal.valueOf(quantity)).setScale(2, RoundingMode.HALF_UP);
    }
}
