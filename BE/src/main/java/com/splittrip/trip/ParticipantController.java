package com.splittrip.trip;

import com.splittrip.auth.CurrentUserId;
import com.splittrip.trip.dto.ParticipantPatchRequest;
import com.splittrip.trip.dto.ParticipantRequest;
import com.splittrip.trip.dto.ParticipantResponse;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/trips/{tripId}/participants")
public class ParticipantController {

    private final ParticipantService service;

    public ParticipantController(ParticipantService service) { this.service = service; }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Aggiunge un partecipante senza account (solo chi organizza)")
    public ParticipantResponse add(@CurrentUserId UUID userId, @PathVariable UUID tripId,
                                   @Valid @RequestBody ParticipantRequest req) {
        return service.add(tripId, userId, req);
    }

    @PatchMapping("/{participantId}")
    @Operation(summary = "Modifica nome, peso e date: ciascuno i propri, chi organizza quelli di chiunque")
    public ParticipantResponse update(@CurrentUserId UUID userId, @PathVariable UUID tripId,
                                      @PathVariable UUID participantId, @Valid @RequestBody ParticipantPatchRequest req) {
        return service.update(tripId, userId, participantId, req);
    }

    @DeleteMapping("/{participantId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Lascia il viaggio (o chi organizza lo rimuove): il partecipante resta nello storico")
    public void leave(@CurrentUserId UUID userId, @PathVariable UUID tripId, @PathVariable UUID participantId) {
        service.leave(tripId, userId, participantId);
    }

    @PostMapping("/{participantId}/unlink")
    @Operation(summary = "Scollega l'account dal partecipante (solo chi organizza): perde l'accesso, i soldi restano")
    public ParticipantResponse unlink(@CurrentUserId UUID userId, @PathVariable UUID tripId,
                                      @PathVariable UUID participantId) {
        return service.unlink(tripId, userId, participantId);
    }
}
