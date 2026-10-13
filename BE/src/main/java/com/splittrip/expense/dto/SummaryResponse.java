package com.splittrip.expense.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public record SummaryResponse(BigDecimal total, Map<String, BigDecimal> byCategory, List<PayerTotal> byPayer) {
    public record PayerTotal(UUID userId, String displayName, BigDecimal amount) {}
}
