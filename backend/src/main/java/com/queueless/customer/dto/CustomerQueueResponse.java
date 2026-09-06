package com.queueless.customer.dto;

import com.queueless.queue.enums.QueueStatus;
import com.queueless.queue.enums.TokenStatus;

import java.util.UUID;

public record CustomerQueueResponse(
        UUID customerId,
        UUID queueId,
        UUID tokenId,
        Integer tokenNumber,
        TokenStatus tokenStatus,
        QueueStatus queueStatus,
        Integer currentTokenNumber,
        long peopleAhead,
        int estimatedWaitMinutes
) {
}