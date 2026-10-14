package com.splittrip.trip.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.UUID;

/** participantId facoltativo: il posto senza account che l'utente rivendica (D-32). */
public record JoinRequest(@NotBlank String code, UUID participantId) {}
