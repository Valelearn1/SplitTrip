package com.splittrip.live;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class LivePublisher {

    private final SimpMessagingTemplate template;

    public LivePublisher(SimpMessagingTemplate template) { this.template = template; }

    public void toTrip(UUID tripId, String type, Object data) {
        template.convertAndSend("/topic/trips/" + tripId, new LiveEnvelope(type, data));
    }

    public void toUser(UUID userId, Object payload) {
        template.convertAndSendToUser(userId.toString(), "/queue/notifications", payload);
    }
}
