package com.queueless.queue.controller;

import com.queueless.queue.dto.CreateQueueRequest;
import com.queueless.queue.dto.QueueResponse;
import com.queueless.queue.dto.QueueStatusResponse;
import com.queueless.queue.service.QueueService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/queues")
@RequiredArgsConstructor
public class QueueController {

    private final QueueService queueService;

    // ADMIN and STAFF can create queues
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @PostMapping
    public ResponseEntity<QueueResponse> create(
            @Valid @RequestBody CreateQueueRequest request
    ) {

        QueueResponse response = queueService.create(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // ADMIN, STAFF and CUSTOMER can view queues
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'CUSTOMER')")
    @GetMapping
    public ResponseEntity<List<QueueResponse>> getAll() {

        return ResponseEntity.ok(
                queueService.getAll()
        );
    }

    // ADMIN, STAFF and CUSTOMER can view a queue
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'CUSTOMER')")
    @GetMapping("/{id}")
    public ResponseEntity<QueueResponse> getById(
            @PathVariable UUID id
    ) {

        return ResponseEntity.ok(
                queueService.getById(id)
        );
    }

    // Anyone authenticated can see queue status
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'CUSTOMER')")
    @GetMapping("/{id}/status")
    public ResponseEntity<QueueStatusResponse> getStatus(
            @PathVariable UUID id
    ) {

        return ResponseEntity.ok(
                queueService.getStatus(id)
        );
    }

    // Only ADMIN and STAFF can close queues
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @PatchMapping("/{id}/close")
    public ResponseEntity<QueueResponse> closeQueue(
            @PathVariable UUID id
    ) {

        return ResponseEntity.ok(
                queueService.closeQueue(id)
        );
    }

    // Only ADMIN and STAFF can open queues
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @PatchMapping("/{id}/open")
    public ResponseEntity<QueueResponse> openQueue(
            @PathVariable UUID id
    ) {

        return ResponseEntity.ok(
                queueService.openQueue(id)
        );
    }
}