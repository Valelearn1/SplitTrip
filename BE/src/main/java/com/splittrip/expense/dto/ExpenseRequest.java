package com.splittrip.expense.dto;

import com.splittrip.expense.DayBasis;
import com.splittrip.expense.ExpenseCategory;
import com.splittrip.expense.SplitType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record ExpenseRequest(
        @NotBlank @Size(max = 120) String description,
        @NotNull @DecimalMin("0.01") @Digits(integer = 8, fraction = 2, message = "Al massimo 99.999.999 (due decimali)") BigDecimal amount,
        /** D-69: valuta dello scontrino; vuota = valuta del viaggio. I tetti per valuta li controlla AmountRules. */
        @Pattern(regexp = "^[A-Z]{3}$", message = "Valuta in formato ISO a 3 lettere") String currency,
        /** Quanto vale 1 unità di currency nella valuta del viaggio; obbligatorio se la valuta è diversa. */
        @DecimalMin(value = "0", inclusive = false, message = "Il cambio deve essere maggiore di zero")
        @Digits(integer = 10, fraction = 8, message = "Al massimo 8 decimali") BigDecimal fxRate,
        @NotNull LocalDate date,
        @NotNull ExpenseCategory category,
        @NotNull UUID payerId, // id del partecipante
        @NotNull SplitType splitType,
        DayBasis dayBasis,
        @NotEmpty @Valid List<ShareRequest> shares) {}
