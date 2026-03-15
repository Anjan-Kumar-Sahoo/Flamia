package com.flamia.repository;

import com.flamia.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReviewRepository extends JpaRepository<Review, UUID> {

    Page<Review> findByProductIdOrderByCreatedAtDesc(UUID productId, Pageable pageable);

    Optional<Review> findByUserIdAndProductId(UUID userId, UUID productId);

    boolean existsByUserIdAndProductId(UUID userId, UUID productId);

    long countByProductId(UUID productId);

    @Query("SELECT COALESCE(AVG(r.rating), 0) FROM Review r WHERE r.product.id = :productId")
    BigDecimal calculateAverageRating(@Param("productId") UUID productId);

    @Query("""
        SELECT r.rating as rating, COUNT(r) as count
        FROM Review r
        WHERE r.product.id = :productId
        GROUP BY r.rating
        ORDER BY r.rating DESC
        """)
    java.util.List<Object[]> getRatingDistribution(@Param("productId") UUID productId);

    Page<Review> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query("SELECT r FROM Review r WHERE (:productId IS NULL OR r.product.id = :productId) ORDER BY r.createdAt DESC")
    Page<Review> findAllWithFilter(@Param("productId") UUID productId, Pageable pageable);
}
