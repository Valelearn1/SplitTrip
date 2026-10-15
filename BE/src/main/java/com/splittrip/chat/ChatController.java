package com.splittrip.chat;

import com.splittrip.auth.CurrentUserId;
import com.splittrip.chat.dto.MessagePage;
import com.splittrip.chat.dto.MessageRequest;
import com.splittrip.chat.dto.MessageResponse;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/trips/{tripId}/messages")
public class ChatController {

    public record UnreadCount(long count) {}

    private final ChatService service;

    public ChatController(ChatService service) { this.service = service; }

    @GetMapping
    @Operation(summary = "Storico della chat, più recenti per primi; before = id dell'ultimo ricevuto")
    public MessagePage list(@CurrentUserId UUID userId, @PathVariable UUID tripId,
                            @RequestParam(required = false) UUID before, @RequestParam(required = false) Integer size) {
        return service.list(tripId, userId, before, size);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Invia un messaggio (1–1000 caratteri); arriva a tutti sul canale del viaggio")
    public MessageResponse send(@CurrentUserId UUID userId, @PathVariable UUID tripId, @RequestBody MessageRequest req) {
        return service.send(tripId, userId, req.content());
    }

    @DeleteMapping("/{messageId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Elimina un proprio messaggio: il testo sparisce, resta «Messaggio eliminato»")
    public void delete(@CurrentUserId UUID userId, @PathVariable UUID tripId, @PathVariable UUID messageId) {
        service.delete(tripId, userId, messageId);
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Messaggi non letti nella chat del viaggio")
    public UnreadCount unread(@CurrentUserId UUID userId, @PathVariable UUID tripId) {
        return new UnreadCount(service.unreadCount(tripId, userId));
    }

    @PostMapping("/read")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Segna la chat come letta fino ad ora")
    public void read(@CurrentUserId UUID userId, @PathVariable UUID tripId) {
        service.markRead(tripId, userId);
    }
}
