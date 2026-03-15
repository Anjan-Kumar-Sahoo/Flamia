package com.flamia.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {
    private UUID id;
    private String name;
    private String slug;
    private String description;
    private String shortDescription;
    private BigDecimal price;
    private BigDecimal compareAtPrice;
    private Integer stockQuantity;
    private CategoryResponse category;
    private String scentNotes;
    private String weight;
    private String burnTime;
    private String ingredients;
    private BigDecimal averageRating;
    private Integer reviewCount;
    private Boolean isInStock;
    private Boolean isActive;
    private List<ProductImageResponse> images;
    private String primaryImageUrl;
    private LocalDateTime createdAt;
}
