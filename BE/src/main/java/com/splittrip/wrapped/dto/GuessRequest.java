package com.splittrip.wrapped.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record GuessRequest(@NotNull @DecimalMin("0.00") @Digits(integer = 10, fraction = 2) BigDecimal amount) {}
