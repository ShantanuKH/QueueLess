package com.queueless.servicecenter.exception;

public class ServiceCenterNotFoundException extends RuntimeException {

    public ServiceCenterNotFoundException(String message) {
        super(message);
    }
}