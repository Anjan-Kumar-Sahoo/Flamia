package com.flamia.service;

import com.flamia.dto.request.CreateProductRequest;
import com.flamia.dto.response.CategoryResponse;
import com.flamia.dto.response.PagedResponse;
import com.flamia.dto.response.ProductImageResponse;
import com.flamia.dto.response.ProductResponse;
import com.flamia.entity.Category;
import com.flamia.entity.Product;
import com.flamia.entity.ProductImage;
import com.flamia.exception.DuplicateResourceException;
import com.flamia.exception.ResourceNotFoundException;
import com.flamia.repository.CategoryRepository;
import com.flamia.repository.ProductRepository;
import com.flamia.util.SlugGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    // ── Public Endpoints ──────────────────────────────

    @Transactional(readOnly = true)
    public PagedResponse<ProductResponse> getProducts(UUID categoryId, String search,
            BigDecimal minPrice, BigDecimal maxPrice,
            boolean inStock, String sort, int page, int size) {

        size = Math.min(size, 50);
        Pageable pageable = PageRequest.of(page, size, resolveSort(sort));
        Page<Product> productPage;

        if (search != null && !search.isBlank()) {
            productPage = productRepository.searchByName(search.trim(), pageable);
        } else {
            productPage = productRepository.findAllWithFilters(
                    categoryId, minPrice, maxPrice, inStock, pageable);
        }

        List<ProductResponse> content = productPage.getContent().stream()
                .map(this::toListResponse)
                .toList();

        return PagedResponse.of(content, productPage.getNumber(),
                productPage.getSize(), productPage.getTotalElements(),
                productPage.getTotalPages(), productPage.isLast());
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductBySlug(String slug) {
        Product product = productRepository.findBySlugAndIsActiveTrue(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "slug", slug));
        return toDetailResponse(product);
    }

    // ── Admin Endpoints ───────────────────────────────

    @Transactional(readOnly = true)
    public PagedResponse<ProductResponse> getAdminProducts(String search, UUID categoryId,
            Boolean active, int page, int size) {
        size = Math.min(size, 50);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        // Simple admin listing — all products
        Page<Product> productPage = productRepository.findAll(pageable);

        List<ProductResponse> content = productPage.getContent().stream()
                .map(this::toDetailResponse)
                .toList();

        return PagedResponse.of(content, productPage.getNumber(),
                productPage.getSize(), productPage.getTotalElements(),
                productPage.getTotalPages(), productPage.isLast());
    }

    @Transactional
    public ProductResponse createProduct(CreateProductRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));

        String slug = SlugGenerator.generateSlug(request.getName());
        slug = SlugGenerator.makeUnique(slug, productRepository::existsBySlug);

        Product product = Product.builder()
                .name(request.getName())
                .slug(slug)
                .description(request.getDescription())
                .shortDescription(request.getShortDescription())
                .price(request.getPrice())
                .compareAtPrice(request.getCompareAtPrice())
                .stockQuantity(request.getStockQuantity())
                .category(category)
                .scentNotes(request.getScentNotes())
                .weight(request.getWeight())
                .burnTime(request.getBurnTime())
                .ingredients(request.getIngredients())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        // Add images
        if (request.getImages() != null) {
            for (CreateProductRequest.ProductImageRequest imgReq : request.getImages()) {
                ProductImage image = ProductImage.builder()
                        .url(imgReq.getUrl())
                        .altText(imgReq.getAltText())
                        .displayOrder(imgReq.getDisplayOrder())
                        .isPrimary(imgReq.getIsPrimary())
                        .build();
                product.addImage(image);
            }
        }

        product = productRepository.save(product);
        log.info("Product created: id={}, name={}, slug={}", product.getId(), product.getName(), product.getSlug());
        return toDetailResponse(product);
    }

    @Transactional
    public ProductResponse updateProduct(UUID productId, CreateProductRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setShortDescription(request.getShortDescription());
        product.setPrice(request.getPrice());
        product.setCompareAtPrice(request.getCompareAtPrice());
        product.setStockQuantity(request.getStockQuantity());
        product.setCategory(category);
        product.setScentNotes(request.getScentNotes());
        product.setWeight(request.getWeight());
        product.setBurnTime(request.getBurnTime());
        product.setIngredients(request.getIngredients());
        if (request.getIsActive() != null) {
            product.setIsActive(request.getIsActive());
        }

        // Replace images
        if (request.getImages() != null) {
            product.getImages().clear();
            for (CreateProductRequest.ProductImageRequest imgReq : request.getImages()) {
                ProductImage image = ProductImage.builder()
                        .url(imgReq.getUrl())
                        .altText(imgReq.getAltText())
                        .displayOrder(imgReq.getDisplayOrder())
                        .isPrimary(imgReq.getIsPrimary())
                        .build();
                product.addImage(image);
            }
        }

        product = productRepository.save(product);
        log.info("Product updated: id={}", productId);
        return toDetailResponse(product);
    }

    @Transactional
    public void deactivateProduct(UUID productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));
        product.setIsActive(false);
        productRepository.save(product);
        log.info("Product deactivated: id={}", productId);
    }

    // ── Mapping Helpers ───────────────────────────────

    private ProductResponse toListResponse(Product product) {
        String primaryImageUrl = product.getImages().stream()
                .filter(ProductImage::getIsPrimary)
                .findFirst()
                .map(ProductImage::getUrl)
                .orElse(product.getImages().isEmpty() ? null : product.getImages().get(0).getUrl());

        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .slug(product.getSlug())
                .shortDescription(product.getShortDescription())
                .price(product.getPrice())
                .compareAtPrice(product.getCompareAtPrice())
                .stockQuantity(product.getStockQuantity())
                .primaryImageUrl(primaryImageUrl)
                .averageRating(product.getAverageRating())
                .reviewCount(product.getReviewCount())
                .isInStock(product.isInStock())
                .category(CategoryResponse.builder()
                        .id(product.getCategory().getId())
                        .name(product.getCategory().getName())
                        .slug(product.getCategory().getSlug())
                        .build())
                .build();
    }

    private ProductResponse toDetailResponse(Product product) {
        List<ProductImageResponse> images = product.getImages().stream()
                .map(img -> ProductImageResponse.builder()
                        .id(img.getId())
                        .url(img.getUrl())
                        .altText(img.getAltText())
                        .displayOrder(img.getDisplayOrder())
                        .isPrimary(img.getIsPrimary())
                        .build())
                .toList();

        String primaryImageUrl = images.stream()
                .filter(ProductImageResponse::getIsPrimary)
                .findFirst()
                .map(ProductImageResponse::getUrl)
                .orElse(images.isEmpty() ? null : images.get(0).getUrl());

        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .slug(product.getSlug())
                .description(product.getDescription())
                .shortDescription(product.getShortDescription())
                .price(product.getPrice())
                .compareAtPrice(product.getCompareAtPrice())
                .stockQuantity(product.getStockQuantity())
                .category(CategoryResponse.builder()
                        .id(product.getCategory().getId())
                        .name(product.getCategory().getName())
                        .slug(product.getCategory().getSlug())
                        .build())
                .scentNotes(product.getScentNotes())
                .weight(product.getWeight())
                .burnTime(product.getBurnTime())
                .ingredients(product.getIngredients())
                .averageRating(product.getAverageRating())
                .reviewCount(product.getReviewCount())
                .isInStock(product.isInStock())
                .isActive(product.getIsActive())
                .images(images)
                .primaryImageUrl(primaryImageUrl)
                .createdAt(product.getCreatedAt())
                .build();
    }

    private Sort resolveSort(String sortParam) {
        if (sortParam == null) return Sort.by(Sort.Direction.DESC, "createdAt");
        return switch (sortParam) {
            case "name_asc" -> Sort.by(Sort.Direction.ASC, "name");
            case "name_desc" -> Sort.by(Sort.Direction.DESC, "name");
            case "price_asc" -> Sort.by(Sort.Direction.ASC, "price");
            case "price_desc" -> Sort.by(Sort.Direction.DESC, "price");
            case "rating" -> Sort.by(Sort.Direction.DESC, "averageRating");
            default -> Sort.by(Sort.Direction.DESC, "createdAt"); // "newest"
        };
    }
}
