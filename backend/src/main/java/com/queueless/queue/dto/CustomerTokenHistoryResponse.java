package com.queueless.queue.dto;

import com.queueless.queue.enums.TokenStatus;

import java.time.LocalDateTime;
import java.util.UUID;

public record CustomerTokenHistoryResponse(
        UUID tokenId,
        UUID queueId,
        Integer tokenNumber,
        TokenStatus status,
        String serviceName,
        String serviceCenterName,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}