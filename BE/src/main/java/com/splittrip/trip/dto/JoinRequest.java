package com.splittrip.trip.dto;

import jakarta.validation.constraints.NotBlank;

public record JoinRequest(@NotBlank String code) {}
