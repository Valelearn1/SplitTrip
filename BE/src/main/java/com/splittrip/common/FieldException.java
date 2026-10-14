package com.splittrip.common;

import org.springframework.http.HttpStatus;

/** 400 con un solo errore di campo, nello stesso formato della validazione dei DTO. */
public class FieldException extends AppException {
    private final String field;

    public FieldException(String field, String message) {
        super(HttpStatus.BAD_REQUEST, "Validazione fallita", message);
        this.field = field;
    }

    public String getField() { return field; }
}
