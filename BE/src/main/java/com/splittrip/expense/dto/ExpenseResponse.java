package com.splittrip.expense.dto;

import com.splittrip.expense.DayBasis;
import com.splittrip.expense.Expense;
import com.splittrip.expense.ExpenseCategory;
import com.splittrip.expense.SplitType;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

public record ExpenseResponse(UUID id, String description, BigDecimal amount, String currency, LocalDate date,
                              ExpenseCategory category, SplitType splitType, DayBasis dayBasis, UUID payerId,
                              String payerName, UUID createdBy, List<ShareResponse> shares, Instant createdAt,
                              UUID receiptPhotoId) {
    public static ExpenseResponse from(Expense e, UUID receiptPhotoId) {
        return new ExpenseResponse(e.getId(), e.getDescription(), e.getAmount(), e.getCurrency(), e.getDate(),
                e.getCategory(), e.getSplitType(), e.getDayBasis(), e.getPayer().getId(), e.getPayer().getDisplayName(),
                e.getCreatedBy().getId(),
                e.getShares().stream().map(ShareResponse::from)
                        .sorted(Comparator.comparing(ShareResponse::displayName)).toList(),
                e.getCreatedAt(), receiptPhotoId);
    }
}
