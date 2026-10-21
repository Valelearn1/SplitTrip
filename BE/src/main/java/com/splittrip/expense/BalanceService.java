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
import com.splittrip.trip.Participant;
import com.splittrip.trip.ParticipantRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class BalanceService {

    private static final String EX_MEMBER = "ex membro";

    private final ExpenseRepository expenses;
    private final SettlementRepository settlements;
    private final ParticipantRepository participants;
    private final TripAccessService access;
    private final BalanceCalculator calculator = new BalanceCalculator();

    public BalanceService(ExpenseRepository expenses, SettlementRepository settlements,
                          ParticipantRepository participants, TripAccessService access) {
        this.expenses = expenses;
        this.settlements = settlements;
        this.participants = participants;
        this.access = access;
    }

    @Transactional(readOnly = true)
    public BalancesResponse balances(UUID tripId, UUID userId) {
        access.requireMember(tripId, userId);
        return computeBalances(tripId);
    }

    /** Saldi senza controllo d'accesso: lo fa chi chiama (balances() o HomeService, che lavora solo sui viaggi dell'utente). */
    @Transactional(readOnly = true)
    public BalancesResponse computeBalances(UUID tripId) {
        Map<UUID, Participant> all = allParticipants(tripId);
        List<UUID> activeIds = all.values().stream().filter(p -> !p.hasLeft()).map(Participant::getId).toList();
        List<ExpenseInput> expenseInputs = expenses.findAllByTripIdWithShares(tripId).stream()
                .map(e -> new ExpenseInput(e.getPayer().getId(), e.getAmountBase(),
                        e.getShares().stream().map(s -> new ShareInput(s.getParticipant().getId(), s.getAmount())).toList()))
                .toList();
        List<SettlementInput> settlementInputs = settlements.findAllByTripIdWithParticipants(tripId).stream()
                .map(s -> new SettlementInput(s.getFromParticipant().getId(), s.getToParticipant().getId(), s.getAmountBase()))
                .toList();

        Result result = calculator.compute(activeIds, expenseInputs, settlementInputs);
        return new BalancesResponse(
                result.balances().stream()
                        .map(b -> new MemberBalanceResponse(b.participantId(), name(all, b.participantId()),
                                hasLeft(all, b.participantId()), b.paid(), b.owed(), b.net()))
                        // chi ha lasciato il viaggio compare solo se ha ancora un saldo aperto
                        .filter(b -> !b.left() || b.net().signum() != 0)
                        .toList(),
                result.suggestedTransfers().stream()
                        .map(t -> new TransferResponse(t.fromParticipantId(), name(all, t.fromParticipantId()),
                                t.toParticipantId(), name(all, t.toParticipantId()), t.amount()))
                        .toList());
    }

    @Transactional(readOnly = true)
    public SummaryResponse summary(UUID tripId, UUID userId) {
        access.requireMember(tripId, userId);
        List<Expense> all = expenses.findAllByTripIdWithShares(tripId);
        Map<UUID, Participant> people = allParticipants(tripId);
        BigDecimal total = all.stream().map(Expense::getAmountBase).reduce(BigDecimal.ZERO, BigDecimal::add).setScale(2);
        Map<String, BigDecimal> byCategory = new TreeMap<>();
        Map<UUID, BigDecimal> payerTotals = new LinkedHashMap<>();
        for (Expense e : all) {
            byCategory.merge(e.getCategory().name(), e.getAmountBase(), BigDecimal::add);
            payerTotals.merge(e.getPayer().getId(), e.getAmountBase(), BigDecimal::add);
        }
        List<SummaryResponse.PayerTotal> byPayer = payerTotals.entrySet().stream()
                .sorted(Map.Entry.<UUID, BigDecimal>comparingByValue().reversed())
                .map(en -> new SummaryResponse.PayerTotal(en.getKey(), name(people, en.getKey()), en.getValue()))
                .toList();
        return new SummaryResponse(total, byCategory, byPayer);
    }

    /** Tutti i partecipanti, anche chi ha lasciato: i loro soldi restano nei conti con il loro nome. */
    private Map<UUID, Participant> allParticipants(UUID tripId) {
        return participants.findByTripIdOrderByJoinedAtAsc(tripId).stream()
                .collect(Collectors.toMap(Participant::getId, Function.identity(), (a, b) -> a, LinkedHashMap::new));
    }

    private static String name(Map<UUID, Participant> all, UUID id) {
        Participant p = all.get(id);
        return p == null ? EX_MEMBER : p.getDisplayName();
    }

    private static boolean hasLeft(Map<UUID, Participant> all, UUID id) {
        Participant p = all.get(id);
        return p == null || p.hasLeft();
    }
}
