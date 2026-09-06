package com.queueless.queue.dto;

import com.queueless.queue.entity.Queue;
import com.queueless.queue.entity.QueueSession;
import com.queueless.queue.enums.QueueStatus;

import java.util.UUID;

public record QueueStatusResponse(
        UUID queueId,
        QueueStatus status,
        Integer currentTokenNumber,
        long peopleWaiting,
        Integer lastTokenNumber,
        Integer estimatedWaitMinutes
) {

    public static QueueStatusResponse from(
            Queue queue,
            QueueSession session,
            long peopleWaiting,
            int estimatedWaitMinutes
    ) {

        return new QueueStatusResponse(
                queue.getId(),
                queue.getStatus(),
                session.getCurrentTokenNumber(),
                peopleWaiting,
                session.getLastTokenNumber(),
                estimatedWaitMinutes
        );
    }
}