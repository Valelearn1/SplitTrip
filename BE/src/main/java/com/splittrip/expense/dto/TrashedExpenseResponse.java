package com.splittrip.expense.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

/** amount: nella valuta del viaggio (D-69). */
public record TrashedExpenseResponse(UUID id, String description, BigDecimal amount, LocalDate date, Instant deletedAt) {}
