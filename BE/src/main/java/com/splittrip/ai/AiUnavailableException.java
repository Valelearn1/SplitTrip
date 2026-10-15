package com.splittrip.ai;

import com.splittrip.common.AppException;
import org.springframework.http.HttpStatus;

/** 503 con un messaggio per le persone; il motivo tecnico resta nei log, mai nel corpo della risposta. */
public class AiUnavailableException extends AppException {
    private final String reason;

    public AiUnavailableException(String reason) {
        super(HttpStatus.SERVICE_UNAVAILABLE, "Consigli non disponibili", "Consigli non disponibili, riprova tra poco");
        this.reason = reason;
    }

    public String getReason() { return reason; }
}
