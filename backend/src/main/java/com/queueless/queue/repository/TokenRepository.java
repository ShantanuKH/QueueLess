package com.queueless.queue.repository;

import com.queueless.queue.entity.Token;
import com.queueless.queue.enums.TokenStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TokenRepository extends JpaRepository<Token, UUID> {

    // ============================================================
    // SESSION-BASED TOKEN QUERIES
    // ============================================================

    List<Token> findByQueueSessionIdOrderByTokenNumberAsc(
            UUID queueSessionId
    );

    boolean existsByQueueSessionIdAndStatus(
            UUID queueSessionId,
            TokenStatus status
    );

    long countByQueueSessionIdAndStatus(
            UUID queueSessionId,
            TokenStatus status
    );

    Optional<Token> findFirstByQueueSessionIdAndStatusOrderByTokenNumberAsc(
            UUID queueSessionId,
            TokenStatus status
    );

    long countByQueueSessionIdAndTokenNumberLessThanAndStatus(
            UUID queueSessionId,
            Integer tokenNumber,
            TokenStatus status
    );

    boolean existsByQueueSessionIdAndCustomerIdAndStatusIn(
            UUID queueSessionId,
            UUID customerId,
            List<TokenStatus> statuses
    );

    Optional<Token> findFirstByCustomerIdAndQueueSessionIdAndStatusInOrderByTokenNumberAsc(
            UUID customerId,
            UUID queueSessionId,
            List<TokenStatus> statuses
    );

    Optional<Token> findFirstByCustomerIdAndStatusInOrderByTokenNumberAsc(
            UUID customerId,
            List<TokenStatus> statuses
    );


    // ============================================================
    // CUSTOMER TOKEN HISTORY
    // ============================================================

    List<Token> findByCustomerIdOrderByCreatedAtDesc(
            UUID customerId
    );
}