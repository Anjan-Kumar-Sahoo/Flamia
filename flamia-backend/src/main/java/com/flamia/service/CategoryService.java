package com.flamia.service;

import com.flamia.dto.request.CreateCategoryRequest;
import com.flamia.dto.response.CategoryResponse;
import com.flamia.entity.Category;
import com.flamia.exception.BusinessRuleException;
import com.flamia.exception.DuplicateResourceException;
import com.flamia.exception.ResourceNotFoundException;
import com.flamia.repository.CategoryRepository;
import com.flamia.repository.ProductRepository;
import com.flamia.util.SlugGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    public List<CategoryResponse> getAllActiveCategories() {
        return categoryRepository.findAllActiveOrdered()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public CategoryResponse createCategory(CreateCategoryRequest request) {
        if (categoryRepository.existsByNameIgnoreCase(request.getName())) {
            throw new DuplicateResourceException("Category with name '" + request.getName() + "' already exists");
        }

        String slug = SlugGenerator.generateSlug(request.getName());
        slug = SlugGenerator.makeUnique(slug, categoryRepository::existsBySlug);

        Category category = Category.builder()
                .name(request.getName())
                .slug(slug)
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .displayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0)
                .isActive(true)
                .build();

        category = categoryRepository.save(category);
        log.info("Category created: id={}, name={}", category.getId(), category.getName());
        return toResponse(category);
    }

    @Transactional
    public CategoryResponse updateCategory(UUID categoryId, CreateCategoryRequest request) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", categoryId));

        category.setName(request.getName());
        category.setDescription(request.getDescription());
        category.setImageUrl(request.getImageUrl());
        if (request.getDisplayOrder() != null) {
            category.setDisplayOrder(request.getDisplayOrder());
        }

        category = categoryRepository.save(category);
        log.info("Category updated: id={}", category.getId());
        return toResponse(category);
    }

    @Transactional
    public void deleteCategory(UUID categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", categoryId));

        long productCount = productRepository.countByCategoryId(categoryId);
        if (productCount > 0) {
            throw new BusinessRuleException(
                    "Cannot delete category with " + productCount + " linked products. Reassign products first.");
        }

        categoryRepository.delete(category);
        log.info("Category deleted: id={}", categoryId);
    }

    private CategoryResponse toResponse(Category category) {
        long productCount = productRepository.countByCategoryId(category.getId());
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .description(category.getDescription())
                .imageUrl(category.getImageUrl())
                .productCount(productCount)
                .build();
    }
}
