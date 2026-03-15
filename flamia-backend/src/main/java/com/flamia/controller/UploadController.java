package com.flamia.controller;

import com.flamia.dto.response.ApiResponse;
import com.flamia.service.StorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
public class UploadController {

    private final StorageService storageService;

    @PostMapping("/product/{productId}")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadProductImage(
            @PathVariable UUID productId,
            @RequestParam("file") MultipartFile file) {
        String url = storageService.uploadProductImage(file, productId);
        return ResponseEntity.ok(ApiResponse.success(Map.of("url", url)));
    }

    @PostMapping("/review/{reviewId}")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadReviewMedia(
            @PathVariable UUID reviewId,
            @RequestParam("file") MultipartFile file) {
        String url = storageService.uploadReviewMedia(file, reviewId);
        return ResponseEntity.ok(ApiResponse.success(Map.of("url", url)));
    }

    @PostMapping("/payment/{orderId}")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadPaymentScreenshot(
            @PathVariable UUID orderId,
            @RequestParam("file") MultipartFile file) {
        String url = storageService.uploadPaymentScreenshot(file, orderId);
        return ResponseEntity.ok(ApiResponse.success(Map.of("url", url)));
    }
}
