package com.queueless.security;

import com.queueless.user.entity.User;
import com.queueless.user.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        // ------------------------------------------------------------
        // 1. Check for Bearer token
        // ------------------------------------------------------------

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        try {

            // --------------------------------------------------------
            // 2. Validate JWT and ensure it is an ACCESS token
            // --------------------------------------------------------

            boolean validToken = jwtService.isTokenValid(token);
            boolean accessToken = jwtService.isAccessToken(token);

            System.out.println("JWT VALID = " + validToken);
            System.out.println("JWT ACCESS TOKEN = " + accessToken);

            if (validToken && accessToken) {

                // ----------------------------------------------------
                // 3. Extract user email
                // ----------------------------------------------------

                String email = jwtService.extractEmail(token);

                System.out.println("JWT EMAIL = " + email);

                // ----------------------------------------------------
                // 4. Find user
                // ----------------------------------------------------

                User user = userRepository.findByEmail(email)
                        .orElse(null);

                System.out.println("JWT USER = " + user);

                // ----------------------------------------------------
                // 5. Authenticate active user
                // ----------------------------------------------------

                if (user != null) {

                    System.out.println("JWT ROLE = " + user.getRole());
                    System.out.println("JWT STATUS = " + user.getStatus());

                    if ("ACTIVE".equals(user.getStatus())
                            && SecurityContextHolder
                            .getContext()
                            .getAuthentication() == null) {

                        UsernamePasswordAuthenticationToken authentication =
                                new UsernamePasswordAuthenticationToken(
                                        user,
                                        null,
                                        List.of(
                                                new SimpleGrantedAuthority(
                                                        "ROLE_" + user.getRole()
                                                )
                                        )
                                );

                        SecurityContextHolder
                                .getContext()
                                .setAuthentication(authentication);

                        System.out.println(
                                "JWT AUTHENTICATION SET = "
                                        + authentication.getAuthorities()
                        );
                    }
                }
            }

        } catch (Exception exception) {

            // --------------------------------------------------------
            // DEBUGGING
            // --------------------------------------------------------
            // Do NOT silently swallow the exception while debugging.
            // This will show the actual reason in the Spring console.

            System.out.println("JWT FILTER ERROR:");
            exception.printStackTrace();
        }

        // ------------------------------------------------------------
        // 6. Continue request
        // ------------------------------------------------------------

        filterChain.doFilter(request, response);
    }
}