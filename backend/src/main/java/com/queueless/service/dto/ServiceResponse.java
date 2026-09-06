package com.queueless.service.dto;

import com.queueless.service.entity.CenterService;
import com.queueless.service.enums.ServiceStatus;

import java.time.LocalDateTime;
import java.util.UUID;

public record ServiceResponse(
        UUID id,
        UUID centerId,
        String name,
        String description,
        Integer estimatedServiceTimeMinutes,
        ServiceStatus status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {

    public static ServiceResponse from(CenterService service) {

        return new ServiceResponse(
                service.getId(),
                service.getCenterId(),
                service.getName(),
                service.getDescription(),
                service.getEstimatedServiceTimeMinutes(),
                service.getStatus(),
                service.getCreatedAt(),
                service.getUpdatedAt()
        );
    }
}