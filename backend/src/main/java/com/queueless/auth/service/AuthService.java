package com.queueless.auth.service;

import com.queueless.auth.dto.AuthResponse;
import com.queueless.auth.dto.LoginRequest;
import com.queueless.auth.dto.RegisterRequest;
import com.queueless.auth.exception.InvalidEmailOrPasswordException;
import com.queueless.customer.entity.Customer;
import com.queueless.customer.repository.CustomerRepository;
import com.queueless.security.JwtService;
import com.queueless.user.entity.User;
import com.queueless.user.enums.UserRole;
import com.queueless.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final CustomerRepository customerRepository;

    // ============================================================
    // REGISTER
    // ============================================================

    @Transactional
    public AuthResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email is already registered");
        }

        User user = User.builder()
                .firstName(request.firstName())
                .lastName(request.lastName())
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .phone(request.phone())
                .status("ACTIVE")
                .role(UserRole.CUSTOMER)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        User savedUser = userRepository.save(user);

        LocalDateTime now = LocalDateTime.now();

        Customer customer = Customer.builder()
                .userId(savedUser.getId())
                .name(savedUser.getFirstName() + " " + savedUser.getLastName())
                .phone(savedUser.getPhone())
                .createdAt(now)
                .updatedAt(now)
                .build();

        customerRepository.save(customer);

        return new AuthResponse(
                savedUser.getId(),
                savedUser.getFirstName(),
                savedUser.getLastName(),
                savedUser.getEmail(),
                savedUser.getRole(),
                null,
                null
        );
    }

    // ============================================================
    // LOGIN
    // ============================================================

    public AuthResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() ->
                        new InvalidEmailOrPasswordException(
                                "Invalid email or password"
                        )
                );

        if (!passwordEncoder.matches(
                request.password(),
                user.getPasswordHash()
        )) {
            throw new InvalidEmailOrPasswordException(
                    "Invalid email or password"
            );
        }

        if (!"ACTIVE".equals(user.getStatus())) {
            throw new IllegalArgumentException(
                    "User account is not active"
            );
        }

        String accessToken =
                jwtService.generateAccessToken(user.getEmail());

        String refreshToken =
                jwtService.generateRefreshToken(user.getEmail());

        return new AuthResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getRole(),
                accessToken,
                refreshToken
        );
    }

    // ============================================================
    // REFRESH ACCESS TOKEN
    // ============================================================

    public AuthResponse refreshAccessToken(String refreshToken) {

        if (!jwtService.isTokenValid(refreshToken)
                || !jwtService.isRefreshToken(refreshToken)) {

            throw new IllegalArgumentException(
                    "Invalid refresh token"
            );
        }

        String email = jwtService.extractEmail(refreshToken);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "User not found"
                        )
                );

        if (!"ACTIVE".equals(user.getStatus())) {
            throw new IllegalArgumentException(
                    "User account is not active"
            );
        }

        String newAccessToken =
                jwtService.generateAccessToken(user.getEmail());

        return new AuthResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getRole(),
                newAccessToken,
                refreshToken
        );
    }
}