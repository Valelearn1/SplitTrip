package com.splittrip.expense.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

/** amount è obbligatorio solo con CUSTOM; weight (peso o notti/giorni) solo con WEIGHT e DAYS. */
public record ShareRequest(@NotNull UUID participantId,
                           @DecimalMin("0.00") @Digits(integer = 10, fraction = 2) BigDecimal amount,
                           @DecimalMin("0.00") @Digits(integer = 6, fraction = 2) BigDecimal weight) {}
