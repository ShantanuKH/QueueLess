package com.queueless.auth.dto;

import com.queueless.user.enums.UserRole;

import java.util.UUID;

public record AuthResponse(
        UUID userId,
        String firstName,
        String lastName,
        String email,
        UserRole role,
        String accessToken,
        String refreshToken
) {
}