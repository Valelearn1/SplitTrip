package com.splittrip.trip.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record TripRequest(
        @NotBlank @Size(max = 80) String name,
        @NotBlank @Size(max = 120) String destination,
        @NotNull LocalDate startDate,
        @NotNull LocalDate endDate,
        @Pattern(regexp = "^[A-Z]{3}$", message = "Valuta in formato ISO a 3 lettere") String currency,
        BigDecimal latitude,
        BigDecimal longitude) {}
