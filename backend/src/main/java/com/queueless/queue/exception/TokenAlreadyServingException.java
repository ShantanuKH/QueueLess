package com.queueless.queue.exception;

public class TokenAlreadyServingException extends RuntimeException {

    public TokenAlreadyServingException(String message) {
        super(message);
    }
}