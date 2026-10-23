package com.splittrip.trip.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

/** La foto del viaggio da usare come copertina (D-71). */
public record CoverRequest(@NotNull UUID photoId) {}
