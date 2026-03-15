package com.flamia.repository;

import com.flamia.entity.Coupon;
import com.flamia.enums.CouponStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CouponRepository extends JpaRepository<Coupon, UUID> {

    Optional<Coupon> findByCodeIgnoreCase(String code);

    boolean existsByCodeIgnoreCase(String code);

    @Query("SELECT c FROM Coupon c WHERE (:status IS NULL OR c.status = :status) ORDER BY c.createdAt DESC")
    Page<Coupon> findAllWithStatusFilter(@Param("status") CouponStatus status, Pageable pageable);
}
