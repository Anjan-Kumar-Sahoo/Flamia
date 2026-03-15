package com.flamia.repository;

import com.flamia.entity.Product;
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
public interface ProductRepository extends JpaRepository<Product, UUID> {

    Optional<Product> findBySlugAndIsActiveTrue(String slug);

    boolean existsBySlug(String slug);

    @Query("""
        SELECT p FROM Product p
        WHERE p.isActive = true
        AND (:categoryId IS NULL OR p.category.id = :categoryId)
        AND (:minPrice IS NULL OR p.price >= :minPrice)
        AND (:maxPrice IS NULL OR p.price <= :maxPrice)
        AND (:inStock = false OR p.stockQuantity > 0)
        """)
    Page<Product> findAllWithFilters(
            @Param("categoryId") UUID categoryId,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("inStock") boolean inStock,
            Pageable pageable
    );

    @Query(value = """
        SELECT * FROM products
        WHERE is_active = true
        AND name ILIKE '%' || :search || '%'
        ORDER BY similarity(name, :search) DESC
        """,
        countQuery = """
        SELECT count(*) FROM products
        WHERE is_active = true
        AND name ILIKE '%' || :search || '%'
        """,
        nativeQuery = true)
    Page<Product> searchByName(@Param("search") String search, Pageable pageable);

    Page<Product> findAllByIsActiveTrue(Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.isActive = true AND p.category.id = :categoryId")
    Page<Product> findByCategoryId(@Param("categoryId") UUID categoryId, Pageable pageable);

    long countByIsActiveTrue();

    long countByCategoryId(UUID categoryId);
}
