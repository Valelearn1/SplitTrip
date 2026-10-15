package com.splittrip.chat;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.UUID;

/** Unica scrittura via STOMP (D-39): effimera, mai salvata. L'interceptor ha già verificato che sei membro. */
@Controller
public class TypingController {

    private final ChatService chat;

    public TypingController(ChatService chat) { this.chat = chat; }

    @MessageMapping("/trips/{tripId}/typing")
    public void typing(@DestinationVariable UUID tripId, Principal principal) {
        chat.typing(tripId, UUID.fromString(principal.getName()));
    }
}
