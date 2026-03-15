package com.flamia.controller;

import com.flamia.dto.request.AuthSyncRequest;
import com.flamia.dto.response.ApiResponse;
import com.flamia.dto.response.UserResponse;
import com.flamia.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/sync")
    public ResponseEntity<ApiResponse<UserResponse>> syncUser(
            @Valid @RequestBody AuthSyncRequest request) {
        UserResponse user = authService.syncUser(request);
        return ResponseEntity.ok(ApiResponse.success("User synced successfully", user));
    }
}
