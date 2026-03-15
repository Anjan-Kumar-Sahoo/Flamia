package com.flamia.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

/**
 * Handles file uploads to Supabase Storage via REST API.
 * Used for product images, review media, and UPI payment screenshots.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class StorageService {

    @Value("${flamia.supabase.url}")
    private String supabaseUrl;

    @Value("${flamia.supabase.service-key}")
    private String serviceKey;

    private final RestTemplate restTemplate = new RestTemplate();

    private static final String PRODUCT_BUCKET = "product-images";
    private static final String REVIEW_BUCKET = "review-media";
    private static final String PAYMENT_BUCKET = "payment-screenshots";

    /**
     * Uploads a file to the specified Supabase Storage bucket.
     *
     * @param file   The multipart file to upload
     * @param bucket The bucket name
     * @param folder Optional subfolder (e.g., product UUID)
     * @return Public URL of the uploaded file
     */
    public String uploadFile(MultipartFile file, String bucket, String folder) {
        String fileName = generateFileName(file.getOriginalFilename());
        String objectPath = folder != null ? folder + "/" + fileName : fileName;

        String uploadUrl = supabaseUrl + "/storage/v1/object/" + bucket + "/" + objectPath;

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + serviceKey);
        headers.set("apikey", serviceKey);
        headers.setContentType(MediaType.valueOf(
                file.getContentType() != null ? file.getContentType() : "application/octet-stream"));
        headers.set("x-upsert", "true");

        try {
            HttpEntity<byte[]> entity = new HttpEntity<>(file.getBytes(), headers);
            ResponseEntity<String> response = restTemplate.exchange(
                    uploadUrl, HttpMethod.POST, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                String publicUrl = supabaseUrl + "/storage/v1/object/public/" + bucket + "/" + objectPath;
                log.info("File uploaded: bucket={}, path={}", bucket, objectPath);
                return publicUrl;
            }

            log.error("Upload failed: status={}, body={}", response.getStatusCode(), response.getBody());
            throw new RuntimeException("File upload failed with status: " + response.getStatusCode());
        } catch (IOException e) {
            log.error("File read error during upload", e);
            throw new RuntimeException("Failed to read uploaded file", e);
        }
    }

    /**
     * Deletes a file from Supabase Storage.
     */
    public void deleteFile(String bucket, String objectPath) {
        String deleteUrl = supabaseUrl + "/storage/v1/object/" + bucket + "/" + objectPath;

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + serviceKey);
        headers.set("apikey", serviceKey);

        try {
            restTemplate.exchange(deleteUrl, HttpMethod.DELETE,
                    new HttpEntity<>(headers), String.class);
            log.info("File deleted: bucket={}, path={}", bucket, objectPath);
        } catch (Exception e) {
            log.warn("Failed to delete file: bucket={}, path={}, error={}",
                    bucket, objectPath, e.getMessage());
        }
    }

    // ── Convenience Methods ───────────────────────────

    public String uploadProductImage(MultipartFile file, UUID productId) {
        return uploadFile(file, PRODUCT_BUCKET, productId.toString());
    }

    public String uploadReviewMedia(MultipartFile file, UUID reviewId) {
        return uploadFile(file, REVIEW_BUCKET, reviewId.toString());
    }

    public String uploadPaymentScreenshot(MultipartFile file, UUID orderId) {
        return uploadFile(file, PAYMENT_BUCKET, orderId.toString());
    }

    // ── Private Helpers ───────────────────────────────

    private String generateFileName(String originalFilename) {
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        return UUID.randomUUID().toString().substring(0, 8) + extension;
    }
}
