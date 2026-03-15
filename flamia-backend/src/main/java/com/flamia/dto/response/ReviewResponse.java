package com.flamia.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponse {
    private UUID id;
    private Integer rating;
    private String comment;
    private String reviewerName;
    private List<ReviewMediaResponse> media;
    private LocalDateTime createdAt;
    private Boolean isOwn;
}
