package com.queueless.ai.dto;

import java.util.UUID;

public record AiQueueContext(
        UUID queueId,
        String queueStatus,
        Integer currentTokenNumber,
        Integer lastTokenNumber,
        long peopleWaiting,
        int estimatedWaitMinutes
) {
}