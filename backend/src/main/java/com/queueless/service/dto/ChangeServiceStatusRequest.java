package com.queueless.service.dto;

import com.queueless.service.enums.ServiceStatus;
import jakarta.validation.constraints.NotNull;

public record ChangeServiceStatusRequest(

        @NotNull(message = "Status is required")
        ServiceStatus status
) {
}