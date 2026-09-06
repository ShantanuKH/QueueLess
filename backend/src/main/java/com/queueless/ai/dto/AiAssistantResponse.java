package com.queueless.ai.dto;

import java.util.UUID;

public record AiAssistantResponse(
        String message,
        UUID recommendedQueueId
) {
}