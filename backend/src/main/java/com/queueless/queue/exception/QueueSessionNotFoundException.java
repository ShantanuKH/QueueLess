package com.queueless.queue.exception;

public class QueueSessionNotFoundException extends RuntimeException {

    public QueueSessionNotFoundException(String message) {
        super(message);
    }
}