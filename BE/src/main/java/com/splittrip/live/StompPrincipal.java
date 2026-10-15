package com.splittrip.live;

import java.security.Principal;
import java.util.UUID;

/** Utente della sessione STOMP: il nome è lo userId, così /user/queue/... arriva alla persona giusta. */
public record StompPrincipal(UUID userId) implements Principal {
    @Override public String getName() { return userId.toString(); }
}
