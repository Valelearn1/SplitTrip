package com.splittrip.common;

import org.springframework.http.HttpStatus;

public class ConflictException extends AppException {
    public ConflictException(String detail) { super(HttpStatus.CONFLICT, "Conflitto", detail); }
}
