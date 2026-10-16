package com.splittrip.expense.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record SettlementRequest(
        @NotNull UUID fromParticipantId,
        @NotNull UUID toParticipantId,
        @NotNull @DecimalMin("0.01") @Digits(integer = 6, fraction = 2, message = "Al massimo 999.999,99 (due decimali)") BigDecimal amount,
        @NotNull LocalDate date,
        @Size(max = 200) String note) {}
