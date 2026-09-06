package com.queueless.queue.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record CreateQueueRequest(

        @NotNull(message = "Service ID is required")
        UUID serviceId

) {
}