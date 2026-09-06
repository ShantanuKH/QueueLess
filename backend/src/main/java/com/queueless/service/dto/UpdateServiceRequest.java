package com.queueless.service.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record UpdateServiceRequest(

        @NotBlank(message = "Name is required")
        String name,

        String description,

        @Min(value = 1, message = "Estimated service time must be at least 1 minute")
        int estimatedServiceTimeMinutes
) {
}