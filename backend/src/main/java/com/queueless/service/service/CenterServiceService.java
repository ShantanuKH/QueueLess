package com.queueless.service.service;

import com.queueless.service.dto.CreateServiceRequest;
import com.queueless.service.dto.ServiceResponse;
import com.queueless.service.dto.UpdateServiceRequest;
import com.queueless.service.entity.CenterService;
import com.queueless.service.enums.ServiceStatus;
import com.queueless.service.exception.ServiceNotFoundException;
import com.queueless.service.repository.CenterServiceRepository;
import com.queueless.servicecenter.exception.ServiceCenterNotFoundException;
import com.queueless.servicecenter.repository.ServiceCenterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CenterServiceService {

    private final CenterServiceRepository centerServiceRepository;
    private final ServiceCenterRepository serviceCenterRepository;


    // =========================================================
    // CREATE SERVICE
    // =========================================================

    public ServiceResponse create(
            UUID centerId,
            CreateServiceRequest request
    ) {

        serviceCenterRepository.findById(centerId)
                .orElseThrow(() ->
                        new ServiceCenterNotFoundException(
                                "Service center not found"
                        )
                );

        LocalDateTime now = LocalDateTime.now();

        CenterService service = CenterService.builder()
                .centerId(centerId)
                .name(request.name())
                .description(request.description())
                .estimatedServiceTimeMinutes(
                        request.estimatedServiceTimeMinutes()
                )
                .status(ServiceStatus.ACTIVE)
                .createdAt(now)
                .updatedAt(now)
                .build();

        CenterService savedService =
                centerServiceRepository.save(service);

        return ServiceResponse.from(savedService);
    }


    // =========================================================
    // GET ALL SERVICES FOR CENTER
    // =========================================================

    public List<ServiceResponse> getAllByCenterId(
            UUID centerId
    ) {

        serviceCenterRepository.findById(centerId)
                .orElseThrow(() ->
                        new ServiceCenterNotFoundException(
                                "Service center not found"
                        )
                );

        return centerServiceRepository
                .findByCenterId(centerId)
                .stream()
                .map(ServiceResponse::from)
                .toList();
    }


    // =========================================================
    // GET SERVICE BY ID
    // =========================================================

    public ServiceResponse getById(UUID serviceId) {

        CenterService service =
                centerServiceRepository.findById(serviceId)
                        .orElseThrow(() ->
                                new ServiceNotFoundException(
                                        "Service not found"
                                )
                        );

        return ServiceResponse.from(service);
    }


    // =========================================================
    // UPDATE SERVICE
    // =========================================================

    public ServiceResponse update(
            UUID serviceId,
            UpdateServiceRequest request
    ) {

        CenterService service =
                centerServiceRepository.findById(serviceId)
                        .orElseThrow(() ->
                                new ServiceNotFoundException(
                                        "Service not found"
                                )
                        );

        service.setName(request.name());
        service.setDescription(request.description());
        service.setEstimatedServiceTimeMinutes(
                request.estimatedServiceTimeMinutes()
        );
        service.setUpdatedAt(LocalDateTime.now());

        CenterService updatedService =
                centerServiceRepository.save(service);

        return ServiceResponse.from(updatedService);
    }


    // =========================================================
    // CHANGE SERVICE STATUS
    // =========================================================

    public ServiceResponse changeStatus(
            UUID serviceId,
            ServiceStatus status
    ) {

        CenterService service =
                centerServiceRepository.findById(serviceId)
                        .orElseThrow(() ->
                                new ServiceNotFoundException(
                                        "Service not found"
                                )
                        );

        service.setStatus(status);
        service.setUpdatedAt(LocalDateTime.now());

        CenterService updatedService =
                centerServiceRepository.save(service);

        return ServiceResponse.from(updatedService);
    }
}