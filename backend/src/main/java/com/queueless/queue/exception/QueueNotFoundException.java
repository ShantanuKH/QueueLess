package com.queueless.queue.exception;

public class QueueNotFoundException extends RuntimeException {

    public QueueNotFoundException(String message) {
        super(message);
    }
}