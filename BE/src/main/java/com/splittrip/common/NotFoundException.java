package com.splittrip.common;

import org.springframework.http.HttpStatus;

public class NotFoundException extends AppException {
    public NotFoundException(String detail) { super(HttpStatus.NOT_FOUND, "Risorsa non trovata", detail); }
}
