package com.flamia.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class CreateReviewRequest {

    @NotNull(message = "Product ID is required")
    private UUID productId;

    @NotNull(message = "Rating is required")
    @Min(value = 1, message = "Rating must be between 1 and 5")
    @Max(value = 5, message = "Rating must be between 1 and 5")
    private Integer rating;

    @Size(max = 2000, message = "Comment must not exceed 2000 characters")
    private String comment;

    @Valid
    private List<ReviewMediaRequest> media;

    @Data
    public static class ReviewMediaRequest {
        @NotBlank(message = "Media type is required")
        private String mediaType;

        @NotBlank(message = "URL is required")
        private String url;

        private String fileName;

        @Max(value = 3145728, message = "File size must not exceed 3MB")
        private Long fileSize;
    }
}
