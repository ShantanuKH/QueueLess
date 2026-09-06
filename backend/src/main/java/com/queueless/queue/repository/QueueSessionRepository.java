package com.queueless.queue.repository;

import com.queueless.queue.entity.QueueSession;
import com.queueless.queue.enums.QueueStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

public interface QueueSessionRepository
        extends JpaRepository<QueueSession, UUID> {

    Optional<QueueSession> findByQueueIdAndStatus(
            UUID queueId,
            QueueStatus status
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT qs
            FROM QueueSession qs
            WHERE qs.queueId = :queueId
            AND qs.status = :status
            """)
    Optional<QueueSession> findByQueueIdAndStatusForUpdate(
            @Param("queueId") UUID queueId,
            @Param("status") QueueStatus status
    );

    Optional<QueueSession> findByQueueIdAndSessionDate(
            UUID queueId,
            LocalDate sessionDate
    );
}