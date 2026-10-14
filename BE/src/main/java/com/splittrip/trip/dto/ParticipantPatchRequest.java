package com.splittrip.trip.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

/** Campi null = non toccare; clearDates = true azzera arrivo e partenza (tutto il viaggio). */
public record ParticipantPatchRequest(
        @Pattern(regexp = ".*\\S.*", message = "non può essere vuoto") @Size(min = 2, max = 40) String displayName,
        @DecimalMin("0.01") @Digits(integer = 4, fraction = 2) BigDecimal defaultWeight,
        LocalDate arrivalDate,
        LocalDate departureDate,
        Boolean clearDates) {}
