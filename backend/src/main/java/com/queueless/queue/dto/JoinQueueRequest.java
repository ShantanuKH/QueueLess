package com.queueless.queue.dto;

import java.util.UUID;

public record JoinQueueRequest(
        UUID customerId
) {
}