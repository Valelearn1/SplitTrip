package com.splittrip.common;

import org.springframework.http.HttpStatus;

public class PayloadTooLargeException extends AppException {
    public PayloadTooLargeException() {
        super(HttpStatus.PAYLOAD_TOO_LARGE, "File troppo grande", "Al massimo 3 MB per foto");
    }
}
