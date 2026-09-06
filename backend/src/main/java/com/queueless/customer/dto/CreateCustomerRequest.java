package com.queueless.customer.dto;

public record CreateCustomerRequest(
        String name,
        String phone
) {
}