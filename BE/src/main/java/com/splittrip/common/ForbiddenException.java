package com.splittrip.common;

import org.springframework.http.HttpStatus;

public class ForbiddenException extends AppException {
    public ForbiddenException(String detail) { super(HttpStatus.FORBIDDEN, "Accesso negato", detail); }
}
