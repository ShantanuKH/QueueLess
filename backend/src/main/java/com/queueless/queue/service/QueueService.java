package com.queueless.queue.service;

import com.queueless.queue.dto.CreateQueueRequest;
import com.queueless.queue.dto.QueueResponse;
import com.queueless.queue.dto.QueueStatusResponse;
import com.queueless.queue.entity.Queue;
import com.queueless.queue.entity.QueueSession;
import com.queueless.queue.enums.QueueStatus;
import com.queueless.queue.enums.TokenStatus;
import com.queueless.queue.exception.QueueNotFoundException;
import com.queueless.queue.repository.QueueRepository;
import com.queueless.queue.repository.QueueSessionRepository;
import com.queueless.queue.repository.TokenRepository;
import com.queueless.service.exception.ServiceNotFoundException;
import com.queueless.service.repository.CenterServiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class QueueService {

    private static final int AVERAGE_SERVICE_TIME_MINUTES = 5;

    private final QueueRepository queueRepository;
    private final CenterServiceRepository centerServiceRepository;
    private final TokenRepository tokenRepository;
    private final QueueSessionRepository queueSessionRepository;


    // ============================================================
    // CREATE QUEUE
    // ============================================================

    @Transactional
    public QueueResponse create(CreateQueueRequest request) {

        // ------------------------------------------------------------
        // 1. Verify service exists
        // ------------------------------------------------------------

        centerServiceRepository.findById(request.serviceId())
                .orElseThrow(() ->
                        new ServiceNotFoundException(
                                "Service not found"
                        )
                );


        // ------------------------------------------------------------
        // 2. Create queue
        // ------------------------------------------------------------

        LocalDateTime now = LocalDateTime.now();

        Queue queue = Queue.builder()
                .serviceId(request.serviceId())
                .status(QueueStatus.ACTIVE)
                .currentTokenNumber(0)
                .lastTokenNumber(0)
                .createdAt(now)
                .updatedAt(now)
                .build();

        Queue savedQueue =
                queueRepository.save(queue);


        // ------------------------------------------------------------
        // 3. Create active queue session
        // ------------------------------------------------------------

        QueueSession session = QueueSession.builder()
                .queueId(savedQueue.getId())
                .sessionDate(now.toLocalDate())
                .status(QueueStatus.ACTIVE)
                .currentTokenNumber(0)
                .lastTokenNumber(0)
                .startedAt(now)
                .createdAt(now)
                .updatedAt(now)
                .build();

        queueSessionRepository.save(session);


        return QueueResponse.from(
                savedQueue,
                session
        );
    }


    // ============================================================
    // GET ALL QUEUES
    // ============================================================

    public List<QueueResponse> getAll() {

        return queueRepository.findAll()
                .stream()
                .map(queue -> {

                    QueueSession session =
                            queueSessionRepository
                                    .findByQueueIdAndStatus(
                                            queue.getId(),
                                            QueueStatus.ACTIVE
                                    )
                                    .orElse(null);

                    return QueueResponse.from(
                            queue,
                            session
                    );
                })
                .toList();
    }


    // ============================================================
    // GET QUEUE BY ID
    // ============================================================

    public QueueResponse getById(UUID id) {

        Queue queue = queueRepository.findById(id)
                .orElseThrow(() ->
                        new QueueNotFoundException(
                                "Queue not found"
                        )
                );

        QueueSession session =
                queueSessionRepository
                        .findByQueueIdAndStatus(
                                id,
                                QueueStatus.ACTIVE
                        )
                        .orElse(null);

        return QueueResponse.from(
                queue,
                session
        );
    }


    // ============================================================
    // GET QUEUE STATUS
    // ============================================================

    public QueueStatusResponse getStatus(UUID queueId) {

        // ------------------------------------------------------------
        // 1. Get queue
        // ------------------------------------------------------------

        Queue queue = queueRepository.findById(queueId)
                .orElseThrow(() ->
                        new QueueNotFoundException(
                                "Queue not found"
                        )
                );


        // ------------------------------------------------------------
        // 2. Get active session
        // ------------------------------------------------------------

        QueueSession session =
                queueSessionRepository
                        .findByQueueIdAndStatus(
                                queueId,
                                QueueStatus.ACTIVE
                        )
                        .orElseThrow(() ->
                                new IllegalStateException(
                                        "No active queue session found"
                                )
                        );


        // ------------------------------------------------------------
        // 3. Count waiting customers
        // ------------------------------------------------------------

        long peopleWaiting =
                tokenRepository.countByQueueSessionIdAndStatus(
                        session.getId(),
                        TokenStatus.WAITING
                );


        // ------------------------------------------------------------
        // 4. Calculate estimated wait
        // ------------------------------------------------------------

        int estimatedWaitMinutes =
                (int) peopleWaiting
                        * AVERAGE_SERVICE_TIME_MINUTES;


        // ------------------------------------------------------------
        // 5. Return queue status
        // ------------------------------------------------------------

        return QueueStatusResponse.from(
                queue,
                session,
                peopleWaiting,
                estimatedWaitMinutes
        );
    }


    // ============================================================
    // CLOSE QUEUE
    // ============================================================

    @Transactional
    public QueueResponse closeQueue(UUID queueId) {

        // ------------------------------------------------------------
        // 1. Lock queue
        // ------------------------------------------------------------

        Queue queue = queueRepository
                .findByIdForUpdate(queueId)
                .orElseThrow(() ->
                        new QueueNotFoundException(
                                "Queue not found"
                        )
                );


        // ------------------------------------------------------------
        // 2. Verify queue is active
        // ------------------------------------------------------------

        if (queue.getStatus() == QueueStatus.CLOSED) {
            throw new IllegalStateException(
                    "Queue is already closed"
            );
        }


        // ------------------------------------------------------------
        // 3. Get active session
        // ------------------------------------------------------------

        QueueSession session =
                queueSessionRepository
                        .findByQueueIdAndStatus(
                                queueId,
                                QueueStatus.ACTIVE
                        )
                        .orElseThrow(() ->
                                new IllegalStateException(
                                        "No active queue session found"
                                )
                        );


        // ------------------------------------------------------------
        // 4. Close session
        // ------------------------------------------------------------

        LocalDateTime now = LocalDateTime.now();

        session.setStatus(QueueStatus.CLOSED);
        session.setClosedAt(now);
        session.setUpdatedAt(now);

        queueSessionRepository.save(session);


        // ------------------------------------------------------------
        // 5. Close queue
        // ------------------------------------------------------------

        queue.setStatus(QueueStatus.CLOSED);
        queue.setUpdatedAt(now);

        Queue savedQueue =
                queueRepository.save(queue);


        return QueueResponse.from(
                savedQueue,
                session
        );
    }


    // ============================================================
    // OPEN QUEUE
    // ============================================================

    @Transactional
    public QueueResponse openQueue(UUID queueId) {

        // ------------------------------------------------------------
        // 1. Lock queue
        // ------------------------------------------------------------

        Queue queue = queueRepository
                .findByIdForUpdate(queueId)
                .orElseThrow(() ->
                        new QueueNotFoundException(
                                "Queue not found"
                        )
                );


        // ------------------------------------------------------------
        // 2. Queue must currently be closed
        // ------------------------------------------------------------

        if (queue.getStatus() == QueueStatus.ACTIVE) {
            throw new IllegalStateException(
                    "Queue is already active"
            );
        }


        // ------------------------------------------------------------
        // 3. Create new queue session
        // ------------------------------------------------------------

        LocalDateTime now = LocalDateTime.now();

        QueueSession session = QueueSession.builder()
                .queueId(queue.getId())
                .sessionDate(now.toLocalDate())
                .status(QueueStatus.ACTIVE)
                .currentTokenNumber(0)
                .lastTokenNumber(0)
                .startedAt(now)
                .createdAt(now)
                .updatedAt(now)
                .build();

        queueSessionRepository.save(session);


        // ------------------------------------------------------------
        // 4. Reset queue-level values
        // ------------------------------------------------------------

        queue.setStatus(QueueStatus.ACTIVE);
        queue.setCurrentTokenNumber(0);
        queue.setLastTokenNumber(0);
        queue.setUpdatedAt(now);

        Queue savedQueue =
                queueRepository.save(queue);


        return QueueResponse.from(
                savedQueue,
                session
        );
    }
}