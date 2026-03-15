package com.flamia.controller;

import com.flamia.dto.response.ApiResponse;
import com.flamia.dto.response.PagedResponse;
import com.flamia.dto.response.ReviewResponse;
import com.flamia.dto.request.CreateReviewRequest;
import com.flamia.security.UserPrincipal;
import com.flamia.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping("/product/{productId}")
    public ResponseEntity<ApiResponse<PagedResponse<ReviewResponse>>> getProductReviews(
            @PathVariable UUID productId,
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        UUID currentUserId = principal != null ? principal.getUserId() : null;
        PagedResponse<ReviewResponse> reviews = reviewService.getProductReviews(
                productId, currentUserId, page, size);
        return ResponseEntity.ok(ApiResponse.success(reviews));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ReviewResponse>> createReview(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateReviewRequest request) {
        ReviewResponse review = reviewService.createReview(principal.getUserId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Review submitted successfully", review));
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Void> deleteReview(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID reviewId) {
        reviewService.deleteReview(principal.getUserId(), reviewId);
        return ResponseEntity.noContent().build();
    }
}
