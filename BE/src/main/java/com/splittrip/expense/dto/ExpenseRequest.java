package com.splittrip.expense.dto;

import com.splittrip.expense.ExpenseCategory;
import com.splittrip.expense.SplitType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record ExpenseRequest(
        @NotBlank @Size(max = 120) String description,
        @NotNull @DecimalMin("0.01") @Digits(integer = 10, fraction = 2) BigDecimal amount,
        @NotNull LocalDate date,
        @NotNull ExpenseCategory category,
        @NotNull UUID payerId,
        @NotNull SplitType splitType,
        @NotEmpty @Valid List<ShareRequest> shares) {}
