package com.splittrip.expense.dto;

import java.util.List;

public record BalancesResponse(List<MemberBalanceResponse> balances, List<TransferResponse> suggestedTransfers) {}
