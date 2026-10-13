package com.splittrip.expense.dto;

import com.splittrip.expense.Settlement;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record SettlementResponse(UUID id, UUID fromUserId, String fromName, UUID toUserId, String toName,
                                 BigDecimal amount, LocalDate date, String note, UUID createdBy, Instant createdAt) {
    public static SettlementResponse from(Settlement s) {
        return new SettlementResponse(s.getId(), s.getFromUser().getId(), s.getFromUser().getDisplayName(),
                s.getToUser().getId(), s.getToUser().getDisplayName(), s.getAmount(), s.getDate(), s.getNote(),
                s.getCreatedBy().getId(), s.getCreatedAt());
    }
}
