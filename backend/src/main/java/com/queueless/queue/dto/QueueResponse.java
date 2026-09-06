package com.queueless.queue.dto;

import com.queueless.queue.entity.Queue;
import com.queueless.queue.entity.QueueSession;
import com.queueless.queue.enums.QueueStatus;

import java.time.LocalDateTime;
import java.util.UUID;

public record QueueResponse(
        UUID id,
        UUID serviceId,
        QueueStatus status,
        Integer currentTokenNumber,
        Integer lastTokenNumber,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {

    public static QueueResponse from(
            Queue queue,
            QueueSession session
    ) {

        return new QueueResponse(
                queue.getId(),
                queue.getServiceId(),
                queue.getStatus(),
                session != null
                        ? session.getCurrentTokenNumber()
                        : 0,
                session != null
                        ? session.getLastTokenNumber()
                        : 0,
                queue.getCreatedAt(),
                queue.getUpdatedAt()
        );
    }
}