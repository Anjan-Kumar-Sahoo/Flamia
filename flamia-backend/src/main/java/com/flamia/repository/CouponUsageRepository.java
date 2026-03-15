package com.flamia.repository;

import com.flamia.entity.CouponUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface CouponUsageRepository extends JpaRepository<CouponUsage, UUID> {

    long countByCouponIdAndUserId(UUID couponId, UUID userId);

    void deleteByCouponIdAndOrderId(UUID couponId, UUID orderId);
}
