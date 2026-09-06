package com.queueless.service.controller;

import com.queueless.service.dto.CreateServiceRequest;
import com.queueless.service.dto.ServiceResponse;
import com.queueless.service.service.CenterServiceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/service-centers/{centerId}/services")
@RequiredArgsConstructor
public class CenterServiceController {

    private final CenterServiceService centerServiceService;

    /**
     * Create a service under a service center.
     *
     * Only ADMIN and STAFF can create services.
     */
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @PostMapping
    public ResponseEntity<ServiceResponse> create(
            @PathVariable UUID centerId,
            @Valid @RequestBody CreateServiceRequest request
    ) {

        ServiceResponse response =
                centerServiceService.create(centerId, request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    /**
     * Get all services belonging to a service center.
     *
     * Anyone can view services.
     */
    @GetMapping
    public ResponseEntity<List<ServiceResponse>> getAll(
            @PathVariable UUID centerId
    ) {

        return ResponseEntity.ok(
                centerServiceService.getAllByCenterId(centerId)
        );
    }
}