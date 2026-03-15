package com.flamia.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AuthSyncRequest {

    @NotBlank(message = "Supabase ID is required")
    private String supabaseId;

    @NotBlank(message = "Phone number is required")
    private String phone;

    private String name;
}
