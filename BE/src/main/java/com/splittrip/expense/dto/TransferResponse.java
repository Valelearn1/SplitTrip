package com.splittrip.expense.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record TransferResponse(UUID fromParticipantId, String fromName, UUID toParticipantId, String toName, BigDecimal amount) {}
