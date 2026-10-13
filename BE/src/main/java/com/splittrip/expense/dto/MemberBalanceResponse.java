package com.splittrip.expense.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record MemberBalanceResponse(UUID userId, String displayName, BigDecimal paid, BigDecimal owed, BigDecimal net) {}
