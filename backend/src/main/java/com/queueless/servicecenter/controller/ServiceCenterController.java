package com.queueless.servicecenter.controller;

import com.queueless.servicecenter.dto.ChangeServiceCenterStatusRequest;
import com.queueless.servicecenter.dto.CreateServiceCenterRequest;
import com.queueless.servicecenter.dto.ServiceCenterResponse;
import com.queueless.servicecenter.dto.UpdateServiceCenterRequest;
import com.queueless.servicecenter.service.ServiceCenterService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/service-centers")
@RequiredArgsConstructor
public class ServiceCenterController {

    private final ServiceCenterService serviceCenterService;


    // =========================================================
    // ADMIN
    // =========================================================

    /**
     * Admin creates a service center.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ServiceCenterResponse create(
            @Valid @RequestBody CreateServiceCenterRequest request
    ) {

        return serviceCenterService.create(request);
    }


    /**
     * Admin updates a service center.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ServiceCenterResponse update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateServiceCenterRequest request
    ) {

        return serviceCenterService.update(id, request);
    }


    /**
     * Admin changes service center status.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}/status")
    public ServiceCenterResponse changeStatus(
            @PathVariable UUID id,
            @Valid @RequestBody ChangeServiceCenterStatusRequest request
    ) {

        return serviceCenterService.changeStatus(
                id,
                request.status()
        );
    }


    // =========================================================
    // PUBLIC
    // =========================================================

    /**
     * Anyone can view service centers.
     */
    @GetMapping
    public List<ServiceCenterResponse> getAll() {

        return serviceCenterService.getAll();
    }


    /**
     * Anyone can view a service center.
     */
    @GetMapping("/{id}")
    public ServiceCenterResponse getById(
            @PathVariable UUID id
    ) {

        return serviceCenterService.getById(id);
    }
}