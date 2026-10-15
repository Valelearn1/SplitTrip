package com.splittrip.user;

import com.splittrip.auth.CurrentUserId;
import com.splittrip.user.dto.*;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/me")
public class ProfileController {

    private final ProfileService service;

    public ProfileController(ProfileService service) { this.service = service; }

    @PatchMapping
    @Operation(summary = "Modifica nome ed email")
    public UserResponse update(@CurrentUserId UUID userId, @Valid @RequestBody ProfilePatchRequest req) { return service.update(userId, req); }

    @PostMapping("/password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Cambia la password (serve quella attuale)")
    public void changePassword(@CurrentUserId UUID userId, @Valid @RequestBody PasswordChangeRequest req) { service.changePassword(userId, req); }

    @PatchMapping("/preferences")
    @Operation(summary = "Preferenze: valuta predefinita, suono dei messaggi, riduci animazioni")
    public UserResponse preferences(@CurrentUserId UUID userId, @Valid @RequestBody PreferencesPatchRequest req) { return service.updatePreferences(userId, req); }

    @GetMapping("/stats")
    @Operation(summary = "I miei numeri: viaggi, destinazioni, speso, foto")
    public StatsResponse stats(@CurrentUserId UUID userId) { return service.stats(userId); }
}
