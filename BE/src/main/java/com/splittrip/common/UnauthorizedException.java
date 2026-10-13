package com.splittrip.common;

import org.springframework.http.HttpStatus;

public class UnauthorizedException extends AppException {
    public UnauthorizedException(String detail) { super(HttpStatus.UNAUTHORIZED, "Non autenticato", detail); }
}
