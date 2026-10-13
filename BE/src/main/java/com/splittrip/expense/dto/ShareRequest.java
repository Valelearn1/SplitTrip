package com.splittrip.expense.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

/** amount è obbligatorio solo con splitType CUSTOM. */
public record ShareRequest(@NotNull UUID userId,
                           @DecimalMin("0.00") @Digits(integer = 10, fraction = 2) BigDecimal amount) {}
