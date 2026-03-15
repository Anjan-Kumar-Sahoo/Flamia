package com.flamia.service;

import com.flamia.dto.request.CreateReviewRequest;
import com.flamia.dto.response.*;
import com.flamia.entity.*;
import com.flamia.enums.ReviewMediaType;
import com.flamia.exception.BusinessRuleException;
import com.flamia.exception.DuplicateResourceException;
import com.flamia.exception.ForbiddenException;
import com.flamia.exception.ResourceNotFoundException;
import com.flamia.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public PagedResponse<ReviewResponse> getProductReviews(UUID productId, UUID currentUserId,
                                                           int page, int size) {
        Pageable pageable = PageRequest.of(page, Math.min(size, 50));
        Page<Review> reviewPage = reviewRepository.findByProductIdOrderByCreatedAtDesc(productId, pageable);

        List<ReviewResponse> content = reviewPage.getContent().stream()
                .map(review -> toResponse(review, currentUserId))
                .toList();

        // Compute aggregates
        BigDecimal averageRating = reviewRepository.calculateAverageRating(productId);
        long totalReviews = reviewRepository.countByProductId(productId);

        return PagedResponse.of(content, reviewPage.getNumber(),
                reviewPage.getSize(), reviewPage.getTotalElements(),
                reviewPage.getTotalPages(), reviewPage.isLast());
    }

    @Transactional
    public ReviewResponse createReview(UUID userId, CreateReviewRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", request.getProductId()));

        // Verify purchase
        List<Order> deliveredOrders = orderRepository.findDeliveredOrdersForUserAndProduct(
                userId, request.getProductId());
        if (deliveredOrders.isEmpty()) {
            throw new ForbiddenException("You can only review products you have purchased and received");
        }

        // Check duplicate
        if (reviewRepository.existsByUserIdAndProductId(userId, request.getProductId())) {
            throw new DuplicateResourceException("You have already reviewed this product");
        }

        Review review = Review.builder()
                .user(user)
                .product(product)
                .rating(request.getRating())
                .comment(request.getComment())
                .build();

        // Add media
        if (request.getMedia() != null) {
            for (CreateReviewRequest.ReviewMediaRequest mediaReq : request.getMedia()) {
                ReviewMediaType mediaType;
                try {
                    mediaType = ReviewMediaType.valueOf(mediaReq.getMediaType().toUpperCase());
                } catch (IllegalArgumentException e) {
                    throw new BusinessRuleException("Invalid media type: " + mediaReq.getMediaType() +
                            ". Only IMAGE and AUDIO are allowed.");
                }

                ReviewMedia media = ReviewMedia.builder()
                        .mediaType(mediaType)
                        .url(mediaReq.getUrl())
                        .fileName(mediaReq.getFileName())
                        .fileSize(mediaReq.getFileSize())
                        .build();
                review.addMedia(media);
            }
        }

        review = reviewRepository.save(review);

        // Recalculate product rating
        updateProductRating(product);

        log.info("Review created: productId={}, userId={}, rating={}",
                request.getProductId(), userId, request.getRating());

        return toResponse(review, userId);
    }

    @Transactional
    public ReviewResponse updateReview(UUID userId, UUID reviewId, int rating, String comment) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", reviewId));

        if (!review.getUser().getId().equals(userId)) {
            throw new ForbiddenException("Review does not belong to you");
        }

        review.setRating(rating);
        review.setComment(comment);
        review = reviewRepository.save(review);

        // Recalculate product rating
        updateProductRating(review.getProduct());

        return toResponse(review, userId);
    }

    @Transactional
    public void deleteReview(UUID userId, UUID reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", reviewId));

        if (!review.getUser().getId().equals(userId)) {
            throw new ForbiddenException("Review does not belong to you");
        }

        Product product = review.getProduct();
        reviewRepository.delete(review);
        updateProductRating(product);

        log.info("Review deleted: reviewId={}, userId={}", reviewId, userId);
    }

    @Transactional
    public void adminDeleteReview(UUID reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", reviewId));

        Product product = review.getProduct();
        reviewRepository.delete(review);
        updateProductRating(product);

        log.info("Review admin-deleted: reviewId={}", reviewId);
    }

    private void updateProductRating(Product product) {
        BigDecimal avgRating = reviewRepository.calculateAverageRating(product.getId());
        long count = reviewRepository.countByProductId(product.getId());
        product.setAverageRating(avgRating);
        product.setReviewCount((int) count);
        productRepository.save(product);
    }

    private ReviewResponse toResponse(Review review, UUID currentUserId) {
        List<ReviewMediaResponse> mediaResponses = review.getMedia().stream()
                .map(m -> ReviewMediaResponse.builder()
                        .id(m.getId())
                        .mediaType(m.getMediaType().name())
                        .url(m.getUrl())
                        .fileName(m.getFileName())
                        .build())
                .toList();

        String reviewerName = review.getUser().getName();
        if (reviewerName == null || reviewerName.isBlank()) {
            String phone = review.getUser().getPhone();
            reviewerName = phone.substring(0, phone.length() - 4).replaceAll(".", "*")
                    + phone.substring(phone.length() - 4);
        }

        return ReviewResponse.builder()
                .id(review.getId())
                .rating(review.getRating())
                .comment(review.getComment())
                .reviewerName(reviewerName)
                .media(mediaResponses)
                .createdAt(review.getCreatedAt())
                .isOwn(currentUserId != null && review.getUser().getId().equals(currentUserId))
                .build();
    }
}
