package com.queueless.queue.dto;

import com.queueless.queue.enums.TokenStatus;

import java.util.UUID;

public record TokenStatusResponse(
        UUID tokenId,
        UUID queueId,
        Integer tokenNumber,
        TokenStatus status,
        long peopleAhead,
        int estimatedWaitMinutes
) {
}