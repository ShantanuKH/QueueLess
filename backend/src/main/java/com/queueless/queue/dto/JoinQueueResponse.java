package com.queueless.queue.dto;

import com.queueless.queue.entity.Token;
import com.queueless.queue.enums.TokenStatus;

import java.util.UUID;

public record JoinQueueResponse(
        UUID tokenId,
        UUID queueId,
        UUID customerId,
        Integer tokenNumber,
        TokenStatus status,
        long peopleAhead,
        int estimatedWaitMinutes
) {

    public static JoinQueueResponse from(
            Token token,
            long peopleAhead,
            int estimatedWaitMinutes
    ) {

        return new JoinQueueResponse(
                token.getId(),
                token.getQueueId(),
                token.getCustomerId(),
                token.getTokenNumber(),
                token.getStatus(),
                peopleAhead,
                estimatedWaitMinutes
        );
    }
}