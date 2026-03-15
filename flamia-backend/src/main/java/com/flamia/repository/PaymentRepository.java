package com.flamia.repository;

import com.flamia.entity.Payment;
import com.flamia.enums.PaymentMethod;
import com.flamia.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {

    Optional<Payment> findByOrderId(UUID orderId);

    long countByMethodAndStatus(PaymentMethod method, PaymentStatus status);
}
