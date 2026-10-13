package com.splittrip.common;

import org.springframework.http.HttpStatus;

public class BadRequestException extends AppException {
    public BadRequestException(String detail) { super(HttpStatus.BAD_REQUEST, "Richiesta non valida", detail); }
}
