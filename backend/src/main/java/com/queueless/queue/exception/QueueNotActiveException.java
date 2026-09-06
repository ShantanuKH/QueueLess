package com.queueless.queue.exception;

public class QueueNotActiveException extends RuntimeException {

    public QueueNotActiveException(String message) {
        super(message);
    }
}