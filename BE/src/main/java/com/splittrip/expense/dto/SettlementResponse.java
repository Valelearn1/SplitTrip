package com.splittrip.expense.dto;

import com.splittrip.expense.Settlement;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record SettlementResponse(UUID id, UUID fromParticipantId, String fromName, UUID toParticipantId, String toName,
                                 BigDecimal amount, LocalDate date, String note, UUID createdBy, Instant createdAt) {
    public static SettlementResponse from(Settlement s) {
        return new SettlementResponse(s.getId(), s.getFromParticipant().getId(), s.getFromParticipant().getDisplayName(),
                s.getToParticipant().getId(), s.getToParticipant().getDisplayName(), s.getAmount(), s.getDate(), s.getNote(),
                s.getCreatedBy().getId(), s.getCreatedAt());
    }
}
