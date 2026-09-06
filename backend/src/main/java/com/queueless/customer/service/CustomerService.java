package com.queueless.customer.service;

import com.queueless.customer.dto.CreateCustomerRequest;
import com.queueless.customer.dto.CustomerResponse;
import com.queueless.customer.entity.Customer;
import com.queueless.customer.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;

    public CustomerResponse create(CreateCustomerRequest request) {

        if (customerRepository.existsByPhone(request.phone())) {
            throw new IllegalStateException(
                    "Customer with this phone number already exists"
            );
        }

        LocalDateTime now = LocalDateTime.now();

        Customer customer = Customer.builder()
                .name(request.name())
                .phone(request.phone())
                .createdAt(now)
                .updatedAt(now)
                .build();

        Customer savedCustomer =
                customerRepository.save(customer);

        return CustomerResponse.from(savedCustomer);
    }

    public CustomerResponse getById(UUID customerId) {

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() ->
                        new IllegalStateException(
                                "Customer not found"
                        )
                );

        return CustomerResponse.from(customer);
    }

    public CustomerResponse getByPhone(String phone) {

        Customer customer = customerRepository.findByPhone(phone)
                .orElseThrow(() ->
                        new IllegalStateException(
                                "Customer not found"
                        )
                );

        return CustomerResponse.from(customer);
    }
}