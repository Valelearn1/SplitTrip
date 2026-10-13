package com.splittrip.expense.dto;

import com.splittrip.expense.ExpenseShare;

import java.math.BigDecimal;
import java.util.UUID;

public record ShareResponse(UUID userId, String displayName, BigDecimal amount) {
    public static ShareResponse from(ExpenseShare s) {
        return new ShareResponse(s.getUser().getId(), s.getUser().getDisplayName(), s.getAmount());
    }
}
