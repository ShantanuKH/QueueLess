package com.queueless.service.controller;

import com.queueless.service.dto.ChangeServiceStatusRequest;
import com.queueless.service.dto.ServiceResponse;
import com.queueless.service.dto.UpdateServiceRequest;
import com.queueless.service.service.CenterServiceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/services")
@RequiredArgsConstructor
public class ServiceController {

    private final CenterServiceService centerServiceService;

    /**
     * Get a service by ID.
     *
     * ADMIN, STAFF and CUSTOMER can view a service.
     */
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'CUSTOMER')")
    @GetMapping("/{serviceId}")
    public ResponseEntity<ServiceResponse> getById(
            @PathVariable UUID serviceId
    ) {

        return ResponseEntity.ok(
                centerServiceService.getById(serviceId)
        );
    }

    /**
     * Update service details.
     *
     * Only ADMIN and STAFF can update services.
     */
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @PutMapping("/{serviceId}")
    public ResponseEntity<ServiceResponse> update(
            @PathVariable UUID serviceId,
            @Valid @RequestBody UpdateServiceRequest request
    ) {

        return ResponseEntity.ok(
                centerServiceService.update(serviceId, request)
        );
    }

    /**
     * Change service status.
     *
     * Only ADMIN and STAFF can change service status.
     */
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @PatchMapping("/{serviceId}/status")
    public ResponseEntity<ServiceResponse> changeStatus(
            @PathVariable UUID serviceId,
            @Valid @RequestBody ChangeServiceStatusRequest request
    ) {

        return ResponseEntity.ok(
                centerServiceService.changeStatus(
                        serviceId,
                        request.status()
                )
        );
    }
}