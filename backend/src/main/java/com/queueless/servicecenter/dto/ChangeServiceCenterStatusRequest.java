package com.queueless.servicecenter.dto;

import com.queueless.servicecenter.entity.ServiceCenterStatus;
import jakarta.validation.constraints.NotNull;

public record ChangeServiceCenterStatusRequest(

        @NotNull(message = "Status is required")
        ServiceCenterStatus status
) {
}