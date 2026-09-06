package com.queueless.servicecenter.dto;

import com.queueless.servicecenter.entity.ServiceCenter;
import com.queueless.servicecenter.entity.ServiceCenterStatus;

import java.time.LocalDateTime;
import java.util.UUID;

public record ServiceCenterResponse(
        UUID id,
        String name,
        String description,
        String addressLine,
        String city,
        String state,
        String postalCode,
        String phone,
        ServiceCenterStatus status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {

    public static ServiceCenterResponse from(ServiceCenter serviceCenter) {

        return new ServiceCenterResponse(
                serviceCenter.getId(),
                serviceCenter.getName(),
                serviceCenter.getDescription(),
                serviceCenter.getAddressLine(),
                serviceCenter.getCity(),
                serviceCenter.getState(),
                serviceCenter.getPostalCode(),
                serviceCenter.getPhone(),
                serviceCenter.getStatus(),
                serviceCenter.getCreatedAt(),
                serviceCenter.getUpdatedAt()
        );
    }
}