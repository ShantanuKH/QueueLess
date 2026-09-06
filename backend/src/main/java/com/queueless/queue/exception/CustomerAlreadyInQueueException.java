package com.queueless.queue.exception;

public class CustomerAlreadyInQueueException extends RuntimeException {

    public CustomerAlreadyInQueueException(String message) {
        super(message);
    }
}