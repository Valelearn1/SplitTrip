package com.splittrip.expense;

import com.splittrip.common.BadRequestException;
import com.splittrip.expense.BalanceCalculator.ShareInput;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/** Divide un importo in proporzione ai pesi; i centesimi di resto vanno a chi ha la parte frazionaria più alta, poi per id (come testo). */
public final class WeightedSplitter {

    private WeightedSplitter() {}

    public static List<ShareInput> split(BigDecimal total, Map<UUID, BigDecimal> weights) {
        BigDecimal sumWeights = weights.values().stream().reduce(BigDecimal.ZERO, BigDecimal::add);
        if (weights.isEmpty() || sumWeights.signum() <= 0) {
            throw new BadRequestException("Almeno un partecipante deve avere un peso maggiore di zero");
        }
        // Ordine per testo dell'id, lo stesso dell'anteprima nel frontend (UUID.compareTo usa long con segno)
        List<UUID> ids = weights.keySet().stream().sorted(Comparator.comparing(UUID::toString)).toList();
        long totalCents = BalanceCalculator.cents(total);
        long[] floor = new long[ids.size()];
        BigDecimal[] fraction = new BigDecimal[ids.size()];
        long assigned = 0;
        for (int i = 0; i < ids.size(); i++) {
            // quota esatta in centesimi, con 10 decimali di precisione per confrontare i resti
            BigDecimal exact = BigDecimal.valueOf(totalCents).multiply(weights.get(ids.get(i)))
                    .divide(sumWeights, 10, RoundingMode.DOWN);
            floor[i] = exact.setScale(0, RoundingMode.DOWN).longValueExact();
            fraction[i] = exact.subtract(BigDecimal.valueOf(floor[i]));
            assigned += floor[i];
        }
        long remainder = totalCents - assigned;
        List<Integer> order = new ArrayList<>();
        for (int i = 0; i < ids.size(); i++) order.add(i);
        order.sort(Comparator.<Integer, BigDecimal>comparing(i -> fraction[i]).reversed().thenComparing(i -> ids.get(i).toString()));
        for (int k = 0; k < remainder; k++) {
            floor[order.get(k)]++;
        }
        List<ShareInput> shares = new ArrayList<>(ids.size());
        for (int i = 0; i < ids.size(); i++) {
            shares.add(new ShareInput(ids.get(i), BalanceCalculator.eur(floor[i])));
        }
        return shares;
    }
}
