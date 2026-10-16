package com.splittrip.wrapped;

import com.splittrip.auth.CurrentUserId;
import com.splittrip.wrapped.dto.GuessRequest;
import com.splittrip.wrapped.dto.WrappedResponse;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/trips/{tripId}/wrapped")
public class WrappedController {

    private final WrappedService service;

    public WrappedController(WrappedService service) { this.service = service; }

    @GetMapping
    @Operation(summary = "Il riepilogo di fine viaggio: numeri, momenti, badge, classifiche, «Indovina il totale»")
    public WrappedResponse get(@CurrentUserId UUID userId, @PathVariable UUID tripId) { return service.get(tripId, userId); }

    @PostMapping("/guess")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "La propria ipotesi sul totale (una sola, non si cambia)")
    public void guess(@CurrentUserId UUID userId, @PathVariable UUID tripId, @Valid @RequestBody GuessRequest req) { service.guess(tripId, userId, req.amount()); }
}
