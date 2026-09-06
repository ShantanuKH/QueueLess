package com.queueless.queue.controller;

import com.queueless.queue.dto.CustomerTokenHistoryResponse;
import com.queueless.queue.dto.JoinQueueResponse;
import com.queueless.queue.dto.TokenResponse;
import com.queueless.queue.dto.TokenStatusResponse;
import com.queueless.queue.service.TokenService;
import com.queueless.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.queueless.customer.dto.CustomerQueueResponse;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class TokenController {

    private final TokenService tokenService;


    // =========================================================
    // CUSTOMER
    // =========================================================

    /**
     * Customer joins a queue.
     *
     * Customer ID is taken from the authenticated JWT user.
     * It is NOT accepted from the request body.
     */
    @PreAuthorize("hasRole('CUSTOMER')")
    @PostMapping("/queues/{queueId}/join")
    public ResponseEntity<JoinQueueResponse> joinQueue(
            @PathVariable UUID queueId,
            Authentication authentication
    ) {

        User user = (User) authentication.getPrincipal();

        return ResponseEntity.ok(
                tokenService.joinQueue(
                        queueId,
                        user.getId()
                )
        );
    }


    /**
     * Customer views their token status.
     */
    @PreAuthorize("hasRole('CUSTOMER')")
    @GetMapping("/tokens/{tokenId}/status")
    public ResponseEntity<TokenStatusResponse> getTokenStatus(
            @PathVariable UUID tokenId,
            Authentication authentication
    ) {

        User user = (User) authentication.getPrincipal();

        return ResponseEntity.ok(
                tokenService.getTokenStatus(
                        tokenId,
                        user.getId()
                )
        );
    }

    /**
     * Customer views their current queue.
     *
     * The customer ID is taken from the authenticated JWT user.
     */
    @PreAuthorize("hasRole('CUSTOMER')")
    @GetMapping("/customers/me/queue")
    public ResponseEntity<CustomerQueueResponse> getCustomerQueue(
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
     * Customer leaves their current queue.
     *
     * The customer ID is taken from the authenticated JWT user.
     */
    @PreAuthorize("hasRole('CUSTOMER')")
    @PostMapping("/customers/me/queue/leave")
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


    // =========================================================
    // STAFF / ADMIN
    // =========================================================

    /**
     * Staff/Admin can view all tokens in a queue.
     */
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @GetMapping("/queues/{queueId}/tokens")
    public ResponseEntity<List<TokenResponse>> getByQueueId(
            @PathVariable UUID queueId
    ) {

        return ResponseEntity.ok(
                tokenService.getByQueueId(queueId)
        );
    }


    /**
     * Staff/Admin can view a specific token.
     */
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @GetMapping("/tokens/{tokenId}")
    public ResponseEntity<TokenResponse> getById(
            @PathVariable UUID tokenId
    ) {

        return ResponseEntity.ok(
                tokenService.getById(tokenId)
        );
    }


    /**
     * Staff/Admin calls the next customer.
     */
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @PostMapping("/queues/{queueId}/next")
    public ResponseEntity<TokenResponse> callNextToken(
            @PathVariable UUID queueId
    ) {

        return ResponseEntity.ok(
                tokenService.callNextToken(queueId)
        );
    }


    /**
     * Staff/Admin marks a token as served.
     */
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @PatchMapping("/tokens/{tokenId}/serve")
    public ResponseEntity<TokenResponse> serveToken(
            @PathVariable UUID tokenId
    ) {

        return ResponseEntity.ok(
                tokenService.serveToken(tokenId)
        );
    }


    /**
     * Staff/Admin cancels a token.
     */
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @PatchMapping("/tokens/{tokenId}/cancel")
    public ResponseEntity<TokenResponse> cancelToken(
            @PathVariable UUID tokenId
    ) {

        return ResponseEntity.ok(
                tokenService.cancelToken(tokenId)
        );
    }



    /**
     * Customer views their queue/token history.
     *
     * The customer ID is taken from the authenticated JWT user.
     */
    @PreAuthorize("hasRole('CUSTOMER')")
    @GetMapping("/customers/me/tokens")
    public ResponseEntity<List<CustomerTokenHistoryResponse>> getCustomerTokens(
            Authentication authentication
    ) {

        User user = (User) authentication.getPrincipal();

        return ResponseEntity.ok(
                tokenService.getCustomerTokens(
                        user.getId()
                )
        );
    }



    @PreAuthorize("hasRole('CUSTOMER')")
    @DeleteMapping("/customers/me/tokens/{tokenId}")
    public ResponseEntity<Void> deleteCustomerToken(
            @PathVariable UUID tokenId,
            Authentication authentication
    ) {
        User user = (User) authentication.getPrincipal();

        tokenService.deleteCustomerToken(
                user.getId(),
                tokenId
        );

        return ResponseEntity.noContent().build();
    }


    @PreAuthorize("hasRole('CUSTOMER')")
    @DeleteMapping("/customers/me/tokens")
    public ResponseEntity<Void> deleteCustomerTokenHistory(
            Authentication authentication
    ) {
        User user = (User) authentication.getPrincipal();

        tokenService.deleteCustomerTokenHistory(
                user.getId()
        );

        return ResponseEntity.noContent().build();
    }

//    // =========================================================
//    // INTERNAL TOKEN GENERATION
//    // =========================================================
//
//    /**
//     * Staff/Admin can generate a token directly.
//     *
//     * This is kept for internal/admin use.
//     * Customers should use /join instead.
//     */
//    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
//    @PostMapping("/queues/{queueId}/tokens")
//    public ResponseEntity<TokenResponse> generateToken(
//            @PathVariable UUID queueId
//    ) {
//
//        TokenResponse response =
//                tokenService.generateToken(queueId);
//
//        return ResponseEntity
//                .status(HttpStatus.CREATED)
//                .body(response);
//    }
}