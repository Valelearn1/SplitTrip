package com.splittrip.expense.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record SettlementRequest(
        @NotNull UUID fromParticipantId,
        @NotNull UUID toParticipantId,
        @NotNull @DecimalMin("0.01") @Digits(integer = 8, fraction = 2, message = "Al massimo 99.999.999 (due decimali)") BigDecimal amount,
        /** D-69: valuta di quello che è passato di mano; vuota = valuta del viaggio. I tetti per valuta li controlla AmountRules. */
        @Pattern(regexp = "^[A-Z]{3}$", message = "Valuta in formato ISO a 3 lettere") String currency,
        @DecimalMin(value = "0", inclusive = false, message = "Il cambio deve essere maggiore di zero")
        @Digits(integer = 10, fraction = 8, message = "Al massimo 8 decimali") BigDecimal fxRate,
        @NotNull LocalDate date,
        @Size(max = 200) String note) {}
