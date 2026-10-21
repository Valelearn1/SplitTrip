package com.splittrip.common.events;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

/** Spesa creata. shareByUserId contiene solo i partecipanti con un account (i soli che ricevono notifiche). */
public record ExpenseCreated(UUID tripId, UUID expenseId, UUID actorUserId, String actorName, String description,
                             Map<UUID, BigDecimal> shareByUserId, BigDecimal amount, String currency,
                             BigDecimal amountBase, String tripCurrency) {
    public ExpenseCreated {
        shareByUserId = Map.copyOf(shareByUserId);
    }
}
