package com.splittrip.user.dto;

import jakarta.validation.constraints.Pattern;

public record PreferencesPatchRequest(
        @Pattern(regexp = "^[A-Z]{3}$", message = "Valuta in formato ISO a 3 lettere") String preferredCurrency,
        Boolean chatSound,
        Boolean reduceMotion) {}
