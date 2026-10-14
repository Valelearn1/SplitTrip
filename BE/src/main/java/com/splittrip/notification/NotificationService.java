package com.splittrip.notification;

import com.splittrip.common.NotFoundException;
import com.splittrip.notification.dto.NotificationResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.util.List;
import java.util.UUID;

@Service
public class NotificationService {

    private final NotificationRepository notifications;
    private final Clock clock;

    public NotificationService(NotificationRepository notifications, Clock clock) {
        this.notifications = notifications;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> list(UUID userId, boolean unreadOnly) {
        var found = unreadOnly
                ? notifications.findTop50ByUserIdAndReadAtIsNullOrderByCreatedAtDesc(userId)
                : notifications.findTop50ByUserIdOrderByCreatedAtDesc(userId);
        return found.stream().map(NotificationResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public long unreadCount(UUID userId) {
        return notifications.countByUserIdAndReadAtIsNull(userId);
    }

    @Transactional
    public void markRead(UUID userId, UUID notificationId) {
        Notification n = notifications.findByIdAndUserId(notificationId, userId)
                .orElseThrow(() -> new NotFoundException("Notifica non trovata"));
        if (n.getReadAt() == null) n.setReadAt(clock.instant());
    }

    @Transactional
    public void markAllRead(UUID userId) {
        notifications.markAllRead(userId, clock.instant());
    }
}
