package com.flamia.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.UUID;

@Data
public class UpiSubmitRequest {

    @NotNull(message = "Order ID is required")
    private UUID orderId;

    @NotBlank(message = "UTR number is required")
    @Size(max = 50, message = "UTR number must not exceed 50 characters")
    private String utrNumber;

    @NotBlank(message = "Screenshot URL is required")
    private String screenshotUrl;
}
