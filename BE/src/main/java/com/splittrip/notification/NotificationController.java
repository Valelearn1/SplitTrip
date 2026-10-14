package com.splittrip.notification;

import com.splittrip.auth.CurrentUserId;
import com.splittrip.notification.dto.NotificationResponse;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    public record UnreadCount(long count) {}

    private final NotificationService service;

    public NotificationController(NotificationService service) { this.service = service; }

    @GetMapping
    @Operation(summary = "Le ultime 50 notifiche dell'utente (solo non lette con unread=true)")
    public List<NotificationResponse> list(@CurrentUserId UUID userId, @RequestParam(defaultValue = "false") boolean unread) {
        return service.list(userId, unread);
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Numero di notifiche non lette, per la campanella")
    public UnreadCount unreadCount(@CurrentUserId UUID userId) {
        return new UnreadCount(service.unreadCount(userId));
    }

    @PatchMapping("/{id}/read")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Segna una notifica come letta")
    public void markRead(@CurrentUserId UUID userId, @PathVariable UUID id) {
        service.markRead(userId, id);
    }

    @PostMapping("/read-all")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Segna tutte le notifiche come lette")
    public void markAllRead(@CurrentUserId UUID userId) {
        service.markAllRead(userId);
    }
}
