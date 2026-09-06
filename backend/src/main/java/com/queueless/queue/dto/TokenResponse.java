package com.queueless.queue.dto;

import com.queueless.queue.entity.Token;
import com.queueless.queue.enums.TokenStatus;

import java.time.LocalDateTime;
import java.util.UUID;

public record TokenResponse(
        UUID id,
        UUID queueId,
        Integer tokenNumber,
        TokenStatus status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {

    public static TokenResponse from(Token token) {

        return new TokenResponse(
                token.getId(),
                token.getQueueId(),
                token.getTokenNumber(),
                token.getStatus(),
                token.getCreatedAt(),
                token.getUpdatedAt()
        );
    }
}