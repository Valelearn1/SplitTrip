package com.splittrip.chat;

import com.splittrip.auth.CurrentUserId;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/trips/{tripId}/messages/{messageId}/reactions")
public class ReactionController {

    private final ReactionService service;

    public ReactionController(ReactionService service) { this.service = service; }

    @PostMapping("/{emoji}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Aggiunge una reazione (👍 ❤️ 😂 😮 😢 🎉); idempotente")
    public void add(@CurrentUserId UUID userId, @PathVariable UUID tripId, @PathVariable UUID messageId, @PathVariable String emoji) {
        service.add(tripId, userId, messageId, emoji);
    }

    @DeleteMapping("/{emoji}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Toglie la propria reazione; idempotente")
    public void remove(@CurrentUserId UUID userId, @PathVariable UUID tripId, @PathVariable UUID messageId, @PathVariable String emoji) {
        service.remove(tripId, userId, messageId, emoji);
    }
}
