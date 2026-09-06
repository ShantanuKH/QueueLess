package com.queueless.queue.service;

import com.queueless.customer.dto.CustomerQueueResponse;
import com.queueless.customer.entity.Customer;
import com.queueless.queue.dto.JoinQueueResponse;
import com.queueless.queue.dto.TokenResponse;
import com.queueless.queue.dto.TokenStatusResponse;
import com.queueless.queue.entity.Queue;
import com.queueless.queue.entity.QueueSession;
import com.queueless.queue.entity.Token;
import com.queueless.queue.enums.QueueStatus;
import com.queueless.queue.enums.TokenStatus;
import com.queueless.queue.exception.*;
import com.queueless.queue.repository.QueueRepository;
import com.queueless.queue.repository.QueueSessionRepository;
import com.queueless.queue.repository.TokenRepository;
import com.queueless.servicecenter.exception.ServiceCenterNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.queueless.service.entity.CenterService;
import com.queueless.service.repository.CenterServiceRepository;
import com.queueless.servicecenter.entity.ServiceCenter;
import com.queueless.servicecenter.repository.ServiceCenterRepository;
import com.queueless.queue.dto.CustomerTokenHistoryResponse;

import com.queueless.customer.repository.CustomerRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TokenService {

    private static final int AVERAGE_SERVICE_TIME_MINUTES = 5;

    private final QueueRepository queueRepository;
    private final TokenRepository tokenRepository;
    private final QueueSessionRepository queueSessionRepository;
    private final CustomerRepository customerRepository;
    private final CenterServiceRepository centerServiceRepository;
    private final ServiceCenterRepository serviceCenterRepository;



    // ============================================================
    // GENERATE TOKEN
    // ============================================================

//    @Transactional
//    public TokenResponse generateToken(UUID queueId) {
//
//        Queue queue = queueRepository.findByIdForUpdate(queueId)
//                .orElseThrow(() ->
//                        new QueueNotFoundException("Queue not found")
//                );
//
//        if (queue.getStatus() == QueueStatus.CLOSED) {
//            throw new QueueClosedException("Queue is closed");
//        }
//
//        if (queue.getStatus() != QueueStatus.ACTIVE) {
//            throw new QueueNotActiveException(
//                    "Cannot generate token as the queue is closed"
//            );
//        }
//
//        QueueSession session = queueSessionRepository
//                .findByQueueIdAndStatus(
//                        queueId,
//                        QueueStatus.ACTIVE
//                )
//                .orElseThrow(() ->
//                        new IllegalStateException(
//                                "No active queue session found"
//                        )
//                );
//
//        int nextTokenNumber =
//                session.getLastTokenNumber() + 1;
//
//        LocalDateTime now = LocalDateTime.now();
//
//        Token token = Token.builder()
//                .queueId(queue.getId())
//                .queueSessionId(session.getId())
//                .tokenNumber(nextTokenNumber)
//                .status(TokenStatus.WAITING)
//                .createdAt(now)
//                .updatedAt(now)
//                .build();
//
//        Token savedToken = tokenRepository.save(token);
//
//        session.setLastTokenNumber(nextTokenNumber);
//        session.setUpdatedAt(now);
//
//        queueSessionRepository.save(session);
//
//        return TokenResponse.from(savedToken);
//    }


    // ============================================================
    // GET ALL TOKENS FOR CURRENT ACTIVE SESSION
    // ============================================================

    public List<TokenResponse> getByQueueId(UUID queueId) {

        queueRepository.findById(queueId)
                .orElseThrow(() ->
                        new QueueNotFoundException("Queue not found")
                );

        QueueSession session = queueSessionRepository
                .findByQueueIdAndStatus(
                        queueId,
                        QueueStatus.ACTIVE
                )
                .orElseThrow(() ->
                        new IllegalStateException(
                                "No active queue session found"
                        )
                );

        return tokenRepository
                .findByQueueSessionIdOrderByTokenNumberAsc(
                        session.getId()
                )
                .stream()
                .map(TokenResponse::from)
                .toList();
    }


    // ============================================================
    // GET TOKEN BY ID
    // ============================================================

    public TokenResponse getById(UUID id) {

        Token token = tokenRepository.findById(id)
                .orElseThrow(() ->
                        new TokenNotFoundException(
                                "Token not found"
                        )
                );

        return TokenResponse.from(token);
    }

// ============================================================
// CALL NEXT TOKEN
// ============================================================

    @Transactional
    public TokenResponse callNextToken(UUID queueId) {

        Queue queue = queueRepository.findByIdForUpdate(queueId)
                .orElseThrow(() ->
                        new QueueNotFoundException("Queue not found")
                );

        if (queue.getStatus() != QueueStatus.ACTIVE) {
            throw new QueueNotActiveException(
                    "Cannot call next token for an inactive queue"
            );
        }

        QueueSession session = queueSessionRepository
                .findByQueueIdAndStatus(
                        queueId,
                        QueueStatus.ACTIVE
                )
                .orElseThrow(() ->
                        new IllegalStateException(
                                "No active queue session found"
                        )
                );

        boolean tokenAlreadyCalled =
                tokenRepository.existsByQueueSessionIdAndStatus(
                        session.getId(),
                        TokenStatus.CALLED
                );

        if (tokenAlreadyCalled) {
            throw new TokenAlreadyServingException(
                    "A token is already being served"
            );
        }

        Token token = tokenRepository
                .findFirstByQueueSessionIdAndStatusOrderByTokenNumberAsc(
                        session.getId(),
                        TokenStatus.WAITING
                )
                .orElseThrow(() ->
                        new TokenNotFoundException(
                                "No waiting token found"
                        )
                );

        LocalDateTime now = LocalDateTime.now();

        // ------------------------------------------------------------
        // 1. Mark token as called
        // ------------------------------------------------------------

        token.setStatus(TokenStatus.CALLED);
        token.setUpdatedAt(now);

        Token savedToken = tokenRepository.save(token);


        // ------------------------------------------------------------
        // 2. Update current token in session
        // ------------------------------------------------------------

        session.setCurrentTokenNumber(
                savedToken.getTokenNumber()
        );
        session.setUpdatedAt(now);

        queueSessionRepository.save(session);


        // ------------------------------------------------------------
        // 3. Update current token in queue
        // ------------------------------------------------------------

        queue.setCurrentTokenNumber(
                savedToken.getTokenNumber()
        );
        queue.setUpdatedAt(now);

        queueRepository.save(queue);


        return TokenResponse.from(savedToken);
    }



    // ============================================================
    // SERVE TOKEN
    // ============================================================

    @Transactional
    public TokenResponse serveToken(UUID tokenId) {

        Token token = tokenRepository.findById(tokenId)
                .orElseThrow(() ->
                        new TokenNotFoundException("Token not found")
                );

        if (token.getStatus() != TokenStatus.CALLED) {
            throw new InvalidTokenStateException(
                    "Only a called token can be served"
            );
        }

        LocalDateTime now = LocalDateTime.now();

        // ------------------------------------------------------------
        // 1. Mark token as served
        // ------------------------------------------------------------

        token.setStatus(TokenStatus.SERVED);
        token.setUpdatedAt(now);

        Token savedToken = tokenRepository.save(token);


        // ------------------------------------------------------------
        // 2. Clear current token from queue/session
        // ------------------------------------------------------------

        QueueSession session = queueSessionRepository
                .findById(token.getQueueSessionId())
                .orElseThrow(() ->
                        new IllegalStateException(
                                "Queue session not found"
                        )
                );

        session.setCurrentTokenNumber(0);
        session.setUpdatedAt(now);

        queueSessionRepository.save(session);


        Queue queue = queueRepository
                .findByIdForUpdate(token.getQueueId())
                .orElseThrow(() ->
                        new QueueNotFoundException(
                                "Queue not found"
                        )
                );

        queue.setCurrentTokenNumber(0);
        queue.setUpdatedAt(now);

        queueRepository.save(queue);


        return TokenResponse.from(savedToken);
    }

    // ============================================================
    // CANCEL TOKEN
    // ============================================================

    @Transactional
    public TokenResponse cancelToken(UUID tokenId) {

        Token token = tokenRepository.findById(tokenId)
                .orElseThrow(() ->
                        new TokenNotFoundException("Token not found")
                );

        if (token.getStatus() == TokenStatus.SERVED) {
            throw new InvalidTokenStateException(
                    "A served token cannot be cancelled"
            );
        }

        if (token.getStatus() == TokenStatus.CANCELLED) {
            throw new InvalidTokenStateException(
                    "A cancelled token cannot be cancelled again"
            );
        }

        boolean wasCalled =
                token.getStatus() == TokenStatus.CALLED;

        LocalDateTime now = LocalDateTime.now();

        // ------------------------------------------------------------
        // 1. Mark token as cancelled
        // ------------------------------------------------------------

        token.setStatus(TokenStatus.CANCELLED);
        token.setUpdatedAt(now);

        Token savedToken = tokenRepository.save(token);


        // ------------------------------------------------------------
        // 2. If it was the currently called token,
        //    clear current token from queue/session
        // ------------------------------------------------------------

        if (wasCalled) {

            QueueSession session = queueSessionRepository
                    .findById(token.getQueueSessionId())
                    .orElseThrow(() ->
                            new IllegalStateException(
                                    "Queue session not found"
                            )
                    );

            session.setCurrentTokenNumber(0);
            session.setUpdatedAt(now);

            queueSessionRepository.save(session);


            Queue queue = queueRepository
                    .findByIdForUpdate(token.getQueueId())
                    .orElseThrow(() ->
                            new QueueNotFoundException(
                                    "Queue not found"
                            )
                    );

            queue.setCurrentTokenNumber(0);
            queue.setUpdatedAt(now);

            queueRepository.save(queue);
        }


        return TokenResponse.from(savedToken);
    }



    @Transactional
    public JoinQueueResponse joinQueue(
            UUID queueId,
            UUID userId
    ) {

        // ------------------------------------------------------------
        // 1. Resolve authenticated User -> Customer
        // ------------------------------------------------------------

        Customer customer = customerRepository.findByUserId(userId)
                .orElseThrow(() ->
                        new IllegalStateException(
                                "Customer profile not found"
                        )
                );

        UUID customerId = customer.getId();


        // ------------------------------------------------------------
        // 2. Lock queue
        // ------------------------------------------------------------

        Queue queue = queueRepository.findByIdForUpdate(queueId)
                .orElseThrow(() ->
                        new QueueNotFoundException(
                                "Queue not found"
                        )
                );


        // ------------------------------------------------------------
        // 3. Queue must be active
        // ------------------------------------------------------------

        if (queue.getStatus() != QueueStatus.ACTIVE) {
            throw new QueueNotActiveException(
                    "Cannot join an inactive queue"
            );
        }


        // ------------------------------------------------------------
        // 4. Get active queue session
        // ------------------------------------------------------------

        QueueSession session =
                queueSessionRepository
                        .findByQueueIdAndStatusForUpdate(
                                queueId,
                                QueueStatus.ACTIVE
                        )
                        .orElseThrow(() ->
                                new IllegalStateException(
                                        "No active queue session found"
                                )
                        );


        // ------------------------------------------------------------
        // 5. Prevent same customer joining twice
        // ------------------------------------------------------------

        boolean alreadyJoined =
                tokenRepository
                        .existsByQueueSessionIdAndCustomerIdAndStatusIn(
                                session.getId(),
                                customerId,
                                List.of(
                                        TokenStatus.WAITING,
                                        TokenStatus.CALLED
                                )
                        );

        if (alreadyJoined) {
            throw new CustomerAlreadyInQueueException(
                    "Customer is already in this queue"
            );
        }


        // ------------------------------------------------------------
        // 6. Generate next token number
        // ------------------------------------------------------------

        int nextTokenNumber =
                session.getLastTokenNumber() + 1;

        LocalDateTime now = LocalDateTime.now();


        // ------------------------------------------------------------
        // 7. Create token
        // ------------------------------------------------------------

        Token token = Token.builder()
                .queueId(queueId)
                .queueSessionId(session.getId())
                .customerId(customerId)
                .tokenNumber(nextTokenNumber)
                .status(TokenStatus.WAITING)
                .createdAt(now)
                .updatedAt(now)
                .build();


        Token savedToken =
                tokenRepository.save(token);


        // ------------------------------------------------------------
        // 8. Update session
        // ------------------------------------------------------------

        session.setLastTokenNumber(nextTokenNumber);
        session.setUpdatedAt(now);

        queueSessionRepository.save(session);


        // ------------------------------------------------------------
        // 9. Calculate people ahead
        // ------------------------------------------------------------

        long peopleAhead =
                tokenRepository
                        .countByQueueSessionIdAndTokenNumberLessThanAndStatus(
                                session.getId(),
                                nextTokenNumber,
                                TokenStatus.WAITING
                        );


        // ------------------------------------------------------------
        // 10. Calculate estimated wait
        // ------------------------------------------------------------

        int estimatedWaitMinutes =
                (int) peopleAhead * AVERAGE_SERVICE_TIME_MINUTES;


        // ------------------------------------------------------------
        // 11. Return response
        // ------------------------------------------------------------

        return JoinQueueResponse.from(
                savedToken,
                peopleAhead,
                estimatedWaitMinutes
        );
    }


    public TokenStatusResponse getTokenStatus(
            UUID tokenId,
            UUID userId
    ) {

        Token token = tokenRepository.findById(tokenId)
                .orElseThrow(() ->
                        new TokenNotFoundException("Token not found")
                );

        Customer customer = customerRepository.findByUserId(userId)
                .orElseThrow(() ->
                        new IllegalStateException(
                                "Customer profile not found"
                        )
                );

        UUID customerId = customer.getId();

        // ------------------------------------------------------------
        // Verify token belongs to authenticated customer
        // ------------------------------------------------------------

        if (!token.getCustomerId().equals(customerId)) {
            throw new TokenNotFoundException("Token not found");
        }

        long peopleAhead = 0;

        if (token.getStatus() == TokenStatus.WAITING) {

            peopleAhead =
                    tokenRepository
                            .countByQueueSessionIdAndTokenNumberLessThanAndStatus(
                                    token.getQueueSessionId(),
                                    token.getTokenNumber(),
                                    TokenStatus.WAITING
                            );
        }

        int estimatedWaitMinutes =
                (int) peopleAhead * AVERAGE_SERVICE_TIME_MINUTES;

        return new TokenStatusResponse(
                token.getId(),
                token.getQueueId(),
                token.getTokenNumber(),
                token.getStatus(),
                peopleAhead,
                estimatedWaitMinutes
        );
    }





    public TokenStatusResponse getQueueStatusForAi(UUID queueId) {

        Queue queue = queueRepository.findById(queueId)
                .orElseThrow(() ->
                        new QueueNotFoundException("Queue not found")
                );

        QueueSession session = queueSessionRepository
                .findByQueueIdAndStatus(
                        queueId,
                        QueueStatus.ACTIVE
                )
                .orElseThrow(() ->
                        new IllegalStateException(
                                "No active queue session found"
                        )
                );

        long peopleAhead =
                tokenRepository
                        .countByQueueSessionIdAndStatus(
                                session.getId(),
                                TokenStatus.WAITING
                        );

        int estimatedWaitMinutes =
                (int) peopleAhead * AVERAGE_SERVICE_TIME_MINUTES;

        return new TokenStatusResponse(
                null,
                queue.getId(),
                null,
                null,
                peopleAhead,
                estimatedWaitMinutes
        );
    }

    public CustomerQueueResponse getCustomerQueue(UUID userId) {

        Customer customer = customerRepository.findByUserId(userId)
                .orElseThrow(() ->
                        new IllegalStateException(
                                "Customer profile not found"
                        )
                );

        UUID customerId = customer.getId();
        // ------------------------------------------------------------
        // 1. Find active token belonging to customer
        // ------------------------------------------------------------

        Token token = tokenRepository
                .findFirstByCustomerIdAndStatusInOrderByTokenNumberAsc(
                        customerId,
                        List.of(
                                TokenStatus.WAITING,
                                TokenStatus.CALLED
                        )
                )
                .orElseThrow(() ->
                        new TokenNotFoundException(
                                "Customer is not currently in a queue"
                        )
                );


        // ------------------------------------------------------------
        // 2. Get queue
        // ------------------------------------------------------------

        Queue queue = queueRepository.findById(token.getQueueId())
                .orElseThrow(() ->
                        new QueueNotFoundException(
                                "Queue not found"
                        )
                );


        // ------------------------------------------------------------
        // 3. Get queue session
        // ------------------------------------------------------------

        QueueSession session = queueSessionRepository
                .findById(token.getQueueSessionId())
                .orElseThrow(() ->
                        new IllegalStateException(
                                "Queue session not found"
                        )
                );


        // ------------------------------------------------------------
        // 4. Calculate people ahead
        // ------------------------------------------------------------

        long peopleAhead = 0;

        if (token.getStatus() == TokenStatus.WAITING) {

            peopleAhead =
                    tokenRepository
                            .countByQueueSessionIdAndTokenNumberLessThanAndStatus(
                                    session.getId(),
                                    token.getTokenNumber(),
                                    TokenStatus.WAITING
                            );
        }


        // ------------------------------------------------------------
        // 5. Calculate estimated wait
        // ------------------------------------------------------------

        int estimatedWaitMinutes =
                (int) peopleAhead * AVERAGE_SERVICE_TIME_MINUTES;


        // ------------------------------------------------------------
        // 6. Return customer queue information
        // ------------------------------------------------------------

        return new CustomerQueueResponse(
                customerId,
                queue.getId(),
                token.getId(),
                token.getTokenNumber(),
                token.getStatus(),
                queue.getStatus(),
                session.getCurrentTokenNumber(),
                peopleAhead,
                estimatedWaitMinutes
        );
    }

    @Transactional
    public TokenResponse leaveQueue(UUID userId) {

        // ------------------------------------------------------------
        // 1. Find customer's active token
        // ------------------------------------------------------------

        Customer customer = customerRepository.findByUserId(userId)
                .orElseThrow(() ->
                        new IllegalStateException(
                                "Customer profile not found"
                        )
                );

        UUID customerId = customer.getId();
        Token token = tokenRepository
                .findFirstByCustomerIdAndStatusInOrderByTokenNumberAsc(
                        customerId,
                        List.of(
                                TokenStatus.WAITING,
                                TokenStatus.CALLED
                        )
                )
                .orElseThrow(() ->
                        new TokenNotFoundException(
                                "Customer is not currently in a queue"
                        )
                );


        // ------------------------------------------------------------
        // 2. Only WAITING or CALLED tokens can be cancelled
        // ------------------------------------------------------------

        if (token.getStatus() != TokenStatus.WAITING &&
                token.getStatus() != TokenStatus.CALLED) {

            throw new InvalidTokenStateException(
                    "Token cannot be cancelled"
            );
        }


        boolean wasCalled =
                token.getStatus() == TokenStatus.CALLED;

        LocalDateTime now = LocalDateTime.now();

        token.setStatus(TokenStatus.CANCELLED);
        token.setUpdatedAt(now);

        Token savedToken = tokenRepository.save(token);


        // ------------------------------------------------------------
        // 3. If the customer was currently being served,
        //    clear the current token
        // ------------------------------------------------------------

        if (wasCalled) {

            Queue queue = queueRepository
                    .findByIdForUpdate(token.getQueueId())
                    .orElseThrow(() ->
                            new QueueNotFoundException(
                                    "Queue not found"
                            )
                    );

            queue.setCurrentTokenNumber(0);
            queue.setUpdatedAt(now);

            queueRepository.save(queue);


            QueueSession session = queueSessionRepository
                    .findById(token.getQueueSessionId())
                    .orElseThrow(() ->
                            new IllegalStateException(
                                    "Queue session not found"
                            )
                    );

            session.setCurrentTokenNumber(0);
            session.setUpdatedAt(now);

            queueSessionRepository.save(session);
        }

        return TokenResponse.from(savedToken);
    }

    // ============================================================
// GET CUSTOMER TOKEN HISTORY
// ============================================================

    public List<CustomerTokenHistoryResponse> getCustomerTokens(UUID userId) {

        Customer customer = customerRepository.findByUserId(userId)
                .orElseThrow(() ->
                        new IllegalStateException(
                                "Customer profile not found"
                        )
                );

        UUID customerId = customer.getId();

        return tokenRepository
                .findByCustomerIdOrderByCreatedAtDesc(customerId)
                .stream()
                .map(token -> {

                    Queue queue = queueRepository.findById(token.getQueueId())
                            .orElseThrow(() ->
                                    new QueueNotFoundException(
                                            "Queue not found"
                                    )
                            );

                    CenterService service =
                            centerServiceRepository.findById(queue.getServiceId())
                                    .orElseThrow(() ->
                                            new ServiceCenterNotFoundException(
                                                    "Service not found"
                                            )
                                    );

                    ServiceCenter serviceCenter =
                            serviceCenterRepository.findById(service.getCenterId())
                                    .orElseThrow(() ->
                                            new ServiceCenterNotFoundException(
                                                    "Service center not found"
                                            )
                                    );

                    return new CustomerTokenHistoryResponse(
                            token.getId(),
                            token.getQueueId(),
                            token.getTokenNumber(),
                            token.getStatus(),
                            service.getName(),
                            serviceCenter.getName(),
                            token.getCreatedAt(),
                            token.getUpdatedAt()
                    );
                })
                .toList();
    }

    public void deleteCustomerToken(UUID userId, UUID tokenId) {
        Customer customer = customerRepository.findByUserId(userId)
                .orElseThrow(() ->
                        new IllegalStateException(
                                "Customer profile not found"
                        )
                );

        Token token = tokenRepository.findById(tokenId)
                .orElseThrow(() ->
                        new IllegalStateException(
                                "Token not found"
                        )
                );

        if (!token.getCustomerId().equals(customer.getId())) {
            throw new IllegalStateException(
                    "You do not have permission to delete this token"
            );
        }

        if (token.getStatus() == TokenStatus.WAITING ||
                token.getStatus() == TokenStatus.CALLED) {
            throw new IllegalStateException(
                    "Active queue tokens cannot be deleted"
            );
        }

        tokenRepository.delete(token);
    }

    public void deleteCustomerTokenHistory(UUID userId) {
        Customer customer = customerRepository.findByUserId(userId)
                .orElseThrow(() ->
                        new IllegalStateException(
                                "Customer profile not found"
                        )
                );

        List<Token> tokens =
                tokenRepository.findByCustomerIdOrderByCreatedAtDesc(
                        customer.getId()
                );

        List<Token> historyTokens = tokens.stream()
                .filter(token ->
                        token.getStatus() == TokenStatus.SERVED ||
                                token.getStatus() == TokenStatus.CANCELLED
                )
                .toList();

        tokenRepository.deleteAll(historyTokens);
    }
}