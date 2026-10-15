package com.splittrip.ai;

import com.splittrip.ai.dto.AiTipsResponse;
import com.splittrip.ai.dto.PackingSuggestions;
import com.splittrip.auth.CurrentUserId;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/trips/{tripId}")
public class AiController {

    private final AiService service;

    public AiController(AiService service) { this.service = service; }

    @GetMapping("/ai/tips")
    @Operation(summary = "Ultimi consigli AI del viaggio, disponibilità e generazioni rimaste oggi")
    public AiTipsResponse tips(@CurrentUserId UUID userId, @PathVariable UUID tripId) {
        return service.tips(tripId, userId);
    }

    @PostMapping("/ai/tips")
    @Operation(summary = "Genera 3–5 consigli per il viaggio (5 generazioni al giorno per viaggio)")
    public AiTipsResponse generate(@CurrentUserId UUID userId, @PathVariable UUID tripId) {
        return service.generateTips(tripId, userId);
    }

    @PostMapping("/todo-lists/{listId}/ai/suggestions")
    @Operation(summary = "Propone voci per una lista Valigia, senza salvarle")
    public PackingSuggestions packing(@CurrentUserId UUID userId, @PathVariable UUID tripId, @PathVariable UUID listId) {
        return service.packing(tripId, listId, userId);
    }
}
