package com.splittrip.expense.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record TransferResponse(UUID fromUserId, String fromName, UUID toUserId, String toName, BigDecimal amount) {}
