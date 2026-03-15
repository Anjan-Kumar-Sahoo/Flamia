package com.flamia.controller;

import com.flamia.dto.request.CreateAddressRequest;
import com.flamia.dto.response.AddressResponse;
import com.flamia.dto.response.ApiResponse;
import com.flamia.security.UserPrincipal;
import com.flamia.service.AddressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AddressResponse>>> getAddresses(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<AddressResponse> addresses = addressService.getUserAddresses(principal.getUserId());
        return ResponseEntity.ok(ApiResponse.success(addresses));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AddressResponse>> createAddress(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateAddressRequest request) {
        AddressResponse address = addressService.createAddress(principal.getUserId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Address created", address));
    }

    @PutMapping("/{addressId}")
    public ResponseEntity<ApiResponse<AddressResponse>> updateAddress(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID addressId,
            @Valid @RequestBody CreateAddressRequest request) {
        AddressResponse address = addressService.updateAddress(principal.getUserId(), addressId, request);
        return ResponseEntity.ok(ApiResponse.success("Address updated", address));
    }

    @DeleteMapping("/{addressId}")
    public ResponseEntity<Void> deleteAddress(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID addressId) {
        addressService.deleteAddress(principal.getUserId(), addressId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{addressId}/default")
    public ResponseEntity<ApiResponse<Void>> setDefault(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID addressId) {
        addressService.setDefault(principal.getUserId(), addressId);
        return ResponseEntity.ok(ApiResponse.success("Default address updated"));
    }
}
