package com.splittrip.common.events;

import java.math.BigDecimal;
import java.util.UUID;

/** Rimborso registrato. fromUserId/toUserId sono null se quel partecipante non ha un account. */
public record SettlementCreated(UUID tripId, UUID actorUserId, String actorName, UUID fromUserId, String fromName,
                                UUID toUserId, String toName, BigDecimal amount) {}
