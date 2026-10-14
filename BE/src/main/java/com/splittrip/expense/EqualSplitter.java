package com.splittrip.expense;

import com.splittrip.expense.BalanceCalculator.ShareInput;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

/** Divide un importo in parti uguali; i centesimi di resto vanno ai primi membri in ordine di id. */
public final class EqualSplitter {

    private EqualSplitter() {}

    public static List<ShareInput> split(BigDecimal total, Collection<UUID> participantIds) {
        List<UUID> sorted = participantIds.stream().distinct().sorted().toList();
        if (sorted.isEmpty()) {
            throw new IllegalArgumentException("Serve almeno un partecipante");
        }
        long cents = BalanceCalculator.cents(total);
        long base = cents / sorted.size();
        long remainder = cents % sorted.size();
        List<ShareInput> shares = new ArrayList<>(sorted.size());
        for (int i = 0; i < sorted.size(); i++) {
            shares.add(new ShareInput(sorted.get(i), BalanceCalculator.eur(base + (i < remainder ? 1 : 0))));
        }
        return shares;
    }
}
