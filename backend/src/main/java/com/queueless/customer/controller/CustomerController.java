package com.queueless.customer.controller;

import com.queueless.customer.dto.CreateCustomerRequest;
import com.queueless.customer.dto.CustomerQueueResponse;
import com.queueless.customer.dto.CustomerResponse;
import com.queueless.customer.service.CustomerService;
import com.queueless.queue.dto.TokenResponse;
import com.queueless.queue.service.TokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;
    private final TokenService tokenService;

    @PostMapping
    public ResponseEntity<CustomerResponse> create(
            @RequestBody CreateCustomerRequest request
    ) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(customerService.create(request));
    }

    @GetMapping("/{customerId}")
    public ResponseEntity<CustomerResponse> getById(
            @PathVariable UUID customerId
    ) {

        return ResponseEntity.ok(
                customerService.getById(customerId)
        );
    }

    @GetMapping("/phone/{phone}")
    public ResponseEntity<CustomerResponse> getByPhone(
            @PathVariable String phone
    ) {

        return ResponseEntity.ok(
                customerService.getByPhone(phone)
        );
    }

    @GetMapping("/{customerId}/queue")
    public ResponseEntity<CustomerQueueResponse> getCustomerQueue(
            @PathVariable UUID customerId
    ) {

        return ResponseEntity.ok(
                tokenService.getCustomerQueue(customerId)
        );
    }

    @DeleteMapping("/{customerId}/queue")
    public ResponseEntity<TokenResponse> leaveQueue(
            @PathVariable UUID customerId
    ) {

        return ResponseEntity.ok(
                tokenService.leaveQueue(customerId)
        );
    }
}