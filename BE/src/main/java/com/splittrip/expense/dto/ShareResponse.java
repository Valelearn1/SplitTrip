package com.splittrip.expense.dto;

import com.splittrip.expense.ExpenseShare;

import java.math.BigDecimal;
import java.util.UUID;

public record ShareResponse(UUID participantId, String displayName, BigDecimal amount, BigDecimal weight) {
    public static ShareResponse from(ExpenseShare s) {
        return new ShareResponse(s.getParticipant().getId(), s.getParticipant().getDisplayName(), s.getAmount(), s.getWeight());
    }
}
