package com.splittrip.trip.dto;

import java.util.UUID;

/** Posto senza account che si può rivendicare entrando col codice (D-32). */
public record UnclaimedParticipant(UUID id, String displayName) {}
