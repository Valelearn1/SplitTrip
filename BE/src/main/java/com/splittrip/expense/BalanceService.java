package com.splittrip.expense;

import com.splittrip.expense.BalanceCalculator.ExpenseInput;
import com.splittrip.expense.BalanceCalculator.Result;
import com.splittrip.expense.BalanceCalculator.SettlementInput;
import com.splittrip.expense.BalanceCalculator.ShareInput;
import com.splittrip.expense.dto.BalancesResponse;
import com.splittrip.expense.dto.MemberBalanceResponse;
import com.splittrip.expense.dto.SummaryResponse;
import com.splittrip.expense.dto.TransferResponse;
import com.splittrip.trip.TripAccessService;
import com.splittrip.trip.TripMember;
import com.splittrip.trip.TripMemberRepository;
import com.splittrip.user.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class BalanceService {

    private static final String EX_MEMBER = "ex membro";

    private final ExpenseRepository expenses;
    private final SettlementRepository settlements;
    private final TripMemberRepository members;
    private final TripAccessService access;
    private final BalanceCalculator calculator = new BalanceCalculator();

    public BalanceService(ExpenseRepository expenses, SettlementRepository settlements,
                          TripMemberRepository members, TripAccessService access) {
        this.expenses = expenses;
        this.settlements = settlements;
        this.members = members;
        this.access = access;
    }

    @Transactional(readOnly = true)
    public BalancesResponse balances(UUID tripId, UUID userId) {
        access.requireMember(tripId, userId);
        Map<UUID, String> names = names(tripId);
        List<ExpenseInput> expenseInputs = expenses.findAllByTripIdWithShares(tripId).stream()
                .map(e -> new ExpenseInput(e.getPayer().getId(), e.getAmount(),
                        e.getShares().stream().map(s -> new ShareInput(s.getUser().getId(), s.getAmount())).toList()))
                .toList();
        List<SettlementInput> settlementInputs = settlements.findAllByTripIdWithUsers(tripId).stream()
                .map(s -> new SettlementInput(s.getFromUser().getId(), s.getToUser().getId(), s.getAmount()))
                .toList();

        Result result = calculator.compute(names.keySet(), expenseInputs, settlementInputs);
        return new BalancesResponse(
                result.balances().stream()
                        .map(b -> new MemberBalanceResponse(b.userId(), names.getOrDefault(b.userId(), EX_MEMBER),
                                b.paid(), b.owed(), b.net()))
                        .toList(),
                result.suggestedTransfers().stream()
                        .map(t -> new TransferResponse(t.fromUserId(), names.getOrDefault(t.fromUserId(), EX_MEMBER),
                                t.toUserId(), names.getOrDefault(t.toUserId(), EX_MEMBER), t.amount()))
                        .toList());
    }

    @Transactional(readOnly = true)
    public SummaryResponse summary(UUID tripId, UUID userId) {
        access.requireMember(tripId, userId);
        List<Expense> all = expenses.findAllByTripIdWithShares(tripId);
        Map<UUID, String> names = names(tripId);
        BigDecimal total = all.stream().map(Expense::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add).setScale(2);
        Map<String, BigDecimal> byCategory = new TreeMap<>();
        Map<UUID, BigDecimal> payerTotals = new LinkedHashMap<>();
        for (Expense e : all) {
            byCategory.merge(e.getCategory().name(), e.getAmount(), BigDecimal::add);
            payerTotals.merge(e.getPayer().getId(), e.getAmount(), BigDecimal::add);
        }
        List<SummaryResponse.PayerTotal> byPayer = payerTotals.entrySet().stream()
                .sorted(Map.Entry.<UUID, BigDecimal>comparingByValue().reversed())
                .map(en -> new SummaryResponse.PayerTotal(en.getKey(), names.getOrDefault(en.getKey(), EX_MEMBER), en.getValue()))
                .toList();
        return new SummaryResponse(total, byCategory, byPayer);
    }

    private Map<UUID, String> names(UUID tripId) {
        return members.findByTripIdOrderByJoinedAtAsc(tripId).stream()
                .map(TripMember::getUser)
                .collect(Collectors.toMap(User::getId, User::getDisplayName, (a, b) -> a, LinkedHashMap::new));
    }
}
