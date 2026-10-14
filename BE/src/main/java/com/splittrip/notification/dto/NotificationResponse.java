package com.splittrip.notification.dto;

import com.splittrip.notification.Notification;
import com.splittrip.notification.NotificationType;

import java.time.Instant;
import java.util.UUID;

public record NotificationResponse(UUID id, UUID tripId, NotificationType type, String message, String link,
                                   Instant readAt, Instant createdAt) {
    public static NotificationResponse from(Notification n) {
        return new NotificationResponse(n.getId(), n.getTrip().getId(), n.getType(), n.getMessage(), n.getLink(),
                n.getReadAt(), n.getCreatedAt());
    }
}
