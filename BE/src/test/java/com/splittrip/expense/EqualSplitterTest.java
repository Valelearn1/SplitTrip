package com.splittrip.expense;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.IntStream;

import static org.assertj.core.api.Assertions.assertThat;

class EqualSplitterTest {

    UUID a = UUID.fromString("00000000-0000-0000-0000-00000000000a");
    UUID b = UUID.fromString("00000000-0000-0000-0000-00000000000b");
    UUID c = UUID.fromString("00000000-0000-0000-0000-00000000000c");

    @Test
    void divisioneEsatta() {
        var shares = EqualSplitter.split(new BigDecimal("90.00"), List.of(a, b, c));
        assertThat(shares).extracting(s -> s.amount()).containsExactly(
                new BigDecimal("30.00"), new BigDecimal("30.00"), new BigDecimal("30.00"));
    }

    @Test
    void iCentesimiDiRestoVannoAiPrimiPerId() {
        var shares = EqualSplitter.split(new BigDecimal("100.00"), List.of(c, a, b));
        assertThat(shares).extracting(s -> s.participantId()).containsExactly(a, b, c);
        assertThat(shares).extracting(s -> s.amount()).containsExactly(
                new BigDecimal("33.34"), new BigDecimal("33.33"), new BigDecimal("33.33"));
    }

    @Test
    void laSommaTornaSempreAlTotale() {
        for (String total : List.of("0.01", "0.02", "1.00", "99.99", "12345.67")) {
            for (int n = 1; n <= 7; n++) {
                List<UUID> ids = IntStream.range(0, n).mapToObj(i -> UUID.randomUUID()).toList();
                var shares = EqualSplitter.split(new BigDecimal(total), ids);
                BigDecimal sum = shares.stream().map(s -> s.amount()).reduce(BigDecimal.ZERO, BigDecimal::add);
                assertThat(sum).isEqualByComparingTo(new BigDecimal(total));
                assertThat(shares).hasSize(n);
            }
        }
    }

    @Test
    void ilCentesimoDiRestoSegueLOrdineDelTestoDellId() {
        UUID low = UUID.fromString("7fffffff-0000-4000-8000-000000000001");
        UUID high = UUID.fromString("80000000-0000-4000-8000-000000000002");
        var shares = EqualSplitter.split(new BigDecimal("0.01"), List.of(high, low));
        assertThat(shares).extracting(s -> s.participantId()).containsExactly(low, high);
        assertThat(shares).extracting(s -> s.amount()).containsExactly(new BigDecimal("0.01"), new BigDecimal("0.00"));
    }
}
