package com.queueless.servicecenter.service;

import com.queueless.servicecenter.dto.CreateServiceCenterRequest;
import com.queueless.servicecenter.dto.ServiceCenterResponse;
import com.queueless.servicecenter.dto.UpdateServiceCenterRequest;
import com.queueless.servicecenter.entity.ServiceCenter;
import com.queueless.servicecenter.entity.ServiceCenterStatus;
import com.queueless.servicecenter.exception.ServiceCenterNotFoundException;
import com.queueless.servicecenter.repository.ServiceCenterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ServiceCenterService {

    private final ServiceCenterRepository serviceCenterRepository;

    public ServiceCenterResponse create(
            CreateServiceCenterRequest request
    ) {

        LocalDateTime now = LocalDateTime.now();

        ServiceCenter serviceCenter = ServiceCenter.builder()
                .name(request.name())
                .description(request.description())
                .addressLine(request.addressLine())
                .city(request.city())
                .state(request.state())
                .postalCode(request.postalCode())
                .phone(request.phone())
                .status(ServiceCenterStatus.ACTIVE)
                .createdAt(now)
                .updatedAt(now)
                .build();

        ServiceCenter savedCenter =
                serviceCenterRepository.save(serviceCenter);

        return ServiceCenterResponse.from(savedCenter);
    }


    public List<ServiceCenterResponse> getAll() {

        return serviceCenterRepository.findAll()
                .stream()
                .map(ServiceCenterResponse::from)
                .toList();
    }


    public ServiceCenterResponse getById(UUID id) {

        ServiceCenter serviceCenter =
                serviceCenterRepository.findById(id)
                        .orElseThrow(() ->
                                new ServiceCenterNotFoundException(
                                        "Service center not found"
                                )
                        );

        return ServiceCenterResponse.from(serviceCenter);
    }


    public ServiceCenterResponse update(
            UUID id,
            UpdateServiceCenterRequest request
    ) {

        ServiceCenter serviceCenter =
                serviceCenterRepository.findById(id)
                        .orElseThrow(() ->
                                new ServiceCenterNotFoundException(
                                        "Service center not found"
                                )
                        );

        serviceCenter.setName(request.name());
        serviceCenter.setDescription(request.description());
        serviceCenter.setAddressLine(request.addressLine());
        serviceCenter.setCity(request.city());
        serviceCenter.setState(request.state());
        serviceCenter.setPostalCode(request.postalCode());
        serviceCenter.setPhone(request.phone());
        serviceCenter.setUpdatedAt(LocalDateTime.now());

        ServiceCenter updatedCenter =
                serviceCenterRepository.save(serviceCenter);

        return ServiceCenterResponse.from(updatedCenter);
    }


    public ServiceCenterResponse changeStatus(
            UUID id,
            ServiceCenterStatus status
    ) {

        ServiceCenter serviceCenter =
                serviceCenterRepository.findById(id)
                        .orElseThrow(() ->
                                new ServiceCenterNotFoundException(
                                        "Service center not found"
                                )
                        );

        serviceCenter.setStatus(status);
        serviceCenter.setUpdatedAt(LocalDateTime.now());

        ServiceCenter updatedCenter =
                serviceCenterRepository.save(serviceCenter);

        return ServiceCenterResponse.from(updatedCenter);
    }
}