package com.splittrip.trip.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

/** Partecipante senza account aggiunto dall'organizzatore. */
public record ParticipantRequest(
        @NotBlank @Size(min = 2, max = 40) String displayName,
        @DecimalMin("0.01") @Digits(integer = 4, fraction = 2) BigDecimal defaultWeight,
        LocalDate arrivalDate,
        LocalDate departureDate) {}
