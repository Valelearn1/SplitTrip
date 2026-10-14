package com.splittrip.expense.dto;

import java.math.BigDecimal;
import java.util.UUID;

/** left = ha lasciato il viaggio (compare solo se il saldo non è zero). */
public record MemberBalanceResponse(UUID participantId, String displayName, boolean left,
                                    BigDecimal paid, BigDecimal owed, BigDecimal net) {}
