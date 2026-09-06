package com.queueless.customer.controller;

import com.queueless.customer.dto.CustomerQueueResponse;
import com.queueless.queue.dto.TokenResponse;
import com.queueless.queue.service.TokenService;
import com.queueless.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customer")
@RequiredArgsConstructor
public class CustomerQueueController {

    private final TokenService tokenService;


    /**
     * Get the authenticated customer's current queue.
     */
    @PreAuthorize("hasRole('CUSTOMER')")
    @GetMapping("/queue")
    public ResponseEntity<CustomerQueueResponse> getMyQueue(
            Authentication authentication
    ) {

        User user = (User) authentication.getPrincipal();

        return ResponseEntity.ok(
                tokenService.getCustomerQueue(
                        user.getId()
                )
        );
    }


    /**
     * Leave the authenticated customer's current queue.
     */
    @PreAuthorize("hasRole('CUSTOMER')")
    @DeleteMapping("/queue")
    public ResponseEntity<TokenResponse> leaveQueue(
            Authentication authentication
    ) {

        User user = (User) authentication.getPrincipal();

        return ResponseEntity.ok(
                tokenService.leaveQueue(
                        user.getId()
                )
        );
    }
}