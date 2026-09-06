package com.queueless.queue.exception;

public class ActiveSessionAlreadyExistsException
        extends RuntimeException {

    public ActiveSessionAlreadyExistsException(String message) {
        super(message);
    }
}