package com.splittrip.expense;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.SortedMap;
import java.util.TreeMap;
import java.util.UUID;

/**
 * Calcola i saldi netti di un viaggio e li semplifica in una lista di trasferimenti.
 * Classe pura: nessuna dipendenza da Spring o dal database.
 */
public final class BalanceCalculator {

    public record ShareInput(UUID participantId, BigDecimal amount) {}
    public record ExpenseInput(UUID payerId, BigDecimal amount, List<ShareInput> shares) {}
    public record SettlementInput(UUID fromParticipantId, UUID toParticipantId, BigDecimal amount) {}
    public record MemberBalance(UUID participantId, BigDecimal paid, BigDecimal owed, BigDecimal net) {}
    public record Transfer(UUID fromParticipantId, UUID toParticipantId, BigDecimal amount) {}
    public record Result(List<MemberBalance> balances, List<Transfer> suggestedTransfers) {}

    public Result compute(Collection<UUID> memberIds, List<ExpenseInput> expenses, List<SettlementInput> settlements) {
        // Tutto in centesimi (long): niente arrotondamenti intermedi.
        SortedMap<UUID, long[]> acc = new TreeMap<>(); // [paid, owed, settledGiven, settledReceived]
        memberIds.forEach(id -> acc.put(id, new long[4]));

        for (ExpenseInput e : expenses) {
            acc.computeIfAbsent(e.payerId(), k -> new long[4])[0] += cents(e.amount());
            for (ShareInput s : e.shares()) {
                acc.computeIfAbsent(s.participantId(), k -> new long[4])[1] += cents(s.amount());
            }
        }
        for (SettlementInput s : settlements) {
            acc.computeIfAbsent(s.fromParticipantId(), k -> new long[4])[2] += cents(s.amount());
            acc.computeIfAbsent(s.toParticipantId(), k -> new long[4])[3] += cents(s.amount());
        }

        List<MemberBalance> balances = new ArrayList<>();
        Map<UUID, Long> nets = new LinkedHashMap<>();
        acc.forEach((id, v) -> {
            long net = v[0] - v[1] + v[2] - v[3];
            nets.put(id, net);
            balances.add(new MemberBalance(id, eur(v[0]), eur(v[1]), eur(net)));
        });
        return new Result(List.copyOf(balances), simplify(nets));
    }

    /** Greedy: il debitore più grande paga il creditore più grande. Al massimo n−1 trasferimenti. */
    private static List<Transfer> simplify(Map<UUID, Long> nets) {
        Comparator<Map.Entry<UUID, Long>> byAmountDescThenId = Comparator
                .<Map.Entry<UUID, Long>>comparingLong(e -> -e.getValue())
                .thenComparing(Map.Entry::getKey);
        List<Map.Entry<UUID, Long>> creditors = nets.entrySet().stream().filter(e -> e.getValue() > 0)
                .map(e -> Map.entry(e.getKey(), e.getValue())).sorted(byAmountDescThenId).toList();
        List<Map.Entry<UUID, Long>> debtors = nets.entrySet().stream().filter(e -> e.getValue() < 0)
                .map(e -> Map.entry(e.getKey(), -e.getValue())).sorted(byAmountDescThenId).toList();

        long[] credit = creditors.stream().mapToLong(Map.Entry::getValue).toArray();
        long[] debt = debtors.stream().mapToLong(Map.Entry::getValue).toArray();
        List<Transfer> transfers = new ArrayList<>();
        int c = 0, d = 0;
        while (c < credit.length && d < debt.length) {
            long amount = Math.min(credit[c], debt[d]);
            transfers.add(new Transfer(debtors.get(d).getKey(), creditors.get(c).getKey(), eur(amount)));
            credit[c] -= amount;
            debt[d] -= amount;
            if (credit[c] == 0) c++;
            if (debt[d] == 0) d++;
        }
        return List.copyOf(transfers);
    }

    static long cents(BigDecimal amount) {
        return amount.setScale(2, RoundingMode.HALF_UP).movePointRight(2).longValueExact();
    }

    static BigDecimal eur(long cents) {
        return BigDecimal.valueOf(cents, 2);
    }
}
