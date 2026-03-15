package com.flamia.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
public class CreateProductRequest {

    @NotBlank(message = "Product name is required")
    @Size(max = 200, message = "Product name must not exceed 200 characters")
    private String name;

    @Size(max = 5000, message = "Description must not exceed 5000 characters")
    private String description;

    @Size(max = 300, message = "Short description must not exceed 300 characters")
    private String shortDescription;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    @Digits(integer = 8, fraction = 2, message = "Price format invalid")
    private BigDecimal price;

    @DecimalMin(value = "0.01", message = "Compare at price must be greater than 0")
    @Digits(integer = 8, fraction = 2, message = "Compare at price format invalid")
    private BigDecimal compareAtPrice;

    @NotNull(message = "Stock quantity is required")
    @Min(value = 0, message = "Stock quantity cannot be negative")
    private Integer stockQuantity;

    @NotNull(message = "Category ID is required")
    private UUID categoryId;

    @Size(max = 500, message = "Scent notes must not exceed 500 characters")
    private String scentNotes;

    private String weight;
    private String burnTime;
    private String ingredients;
    private Boolean isActive;

    @Valid
    private List<ProductImageRequest> images;

    @Data
    public static class ProductImageRequest {
        @NotBlank(message = "Image URL is required")
        private String url;
        private String altText;
        @NotNull(message = "Display order is required")
        private Integer displayOrder;
        @NotNull(message = "Primary flag is required")
        private Boolean isPrimary;
    }
}
