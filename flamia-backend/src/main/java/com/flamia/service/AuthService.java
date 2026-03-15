package com.flamia.service;

import com.flamia.dto.request.AuthSyncRequest;
import com.flamia.dto.response.UserResponse;
import com.flamia.entity.User;
import com.flamia.enums.UserRole;
import com.flamia.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;

    @Transactional
    public UserResponse syncUser(AuthSyncRequest request) {
        User user = userRepository.findBySupabaseId(request.getSupabaseId())
                .map(existingUser -> {
                    // Update last login and optional name
                    existingUser.setLastLoginAt(LocalDateTime.now());
                    if (request.getName() != null && !request.getName().isBlank()) {
                        existingUser.setName(request.getName());
                    }
                    log.info("User synced (existing): phone={}", maskPhone(existingUser.getPhone()));
                    return userRepository.save(existingUser);
                })
                .orElseGet(() -> {
                    // Create new user
                    User newUser = User.builder()
                            .supabaseId(request.getSupabaseId())
                            .phone(request.getPhone())
                            .name(request.getName())
                            .role(UserRole.CUSTOMER)
                            .lastLoginAt(LocalDateTime.now())
                            .build();
                    log.info("User synced (new): phone={}", maskPhone(request.getPhone()));
                    return userRepository.save(newUser);
                });

        return toUserResponse(user);
    }

    private UserResponse toUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .phone(user.getPhone())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }

    private String maskPhone(String phone) {
        if (phone == null || phone.length() < 4) return "****";
        return phone.substring(0, phone.length() - 4).replaceAll(".", "*")
                + phone.substring(phone.length() - 4);
    }
}
