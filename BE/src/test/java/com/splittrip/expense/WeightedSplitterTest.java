package com.splittrip.expense;

import com.splittrip.common.BadRequestException;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class WeightedSplitterTest {

    UUID a = UUID.fromString("00000000-0000-0000-0000-00000000000a");
    UUID b = UUID.fromString("00000000-0000-0000-0000-00000000000b");
    UUID c = UUID.fromString("00000000-0000-0000-0000-00000000000c");

    static Map<UUID, BigDecimal> w(Object... kv) {
        Map<UUID, BigDecimal> m = new LinkedHashMap<>();
        for (int i = 0; i < kv.length; i += 2) m.put((UUID) kv[i], new BigDecimal(kv[i + 1].toString()));
        return m;
    }

    @Test
    void coppiaChePagaPerDue() {
        var shares = WeightedSplitter.split(new BigDecimal("100.00"), w(a, 2, b, 1, c, 1));
        assertThat(shares).extracting(s -> s.amount()).containsExactly(
                new BigDecimal("50.00"), new BigDecimal("25.00"), new BigDecimal("25.00"));
    }

    @Test
    void pesiUgualiSiComportanoComeLaDivisioneEqua() {
        var shares = WeightedSplitter.split(new BigDecimal("100.00"), w(c, 1, a, 1, b, 1));
        assertThat(shares).extracting(s -> s.participantId()).containsExactly(a, b, c);
        assertThat(shares).extracting(s -> s.amount()).containsExactly(
                new BigDecimal("33.34"), new BigDecimal("33.33"), new BigDecimal("33.33"));
    }

    @Test
    void ilRestoVaAChiHaLaParteFrazionariaPiuAlta() {
        // 10,00 con pesi 1/2: 3,333… e 6,666… → il centesimo va a b (0,666 > 0,333)
        var shares = WeightedSplitter.split(new BigDecimal("10.00"), w(a, 1, b, 2));
        assertThat(shares).extracting(s -> s.amount()).containsExactly(new BigDecimal("3.33"), new BigDecimal("6.67"));
    }

    @Test
    void pesoZeroDaQuotaZero() {
        var shares = WeightedSplitter.split(new BigDecimal("10.00"), w(a, 3, b, 0));
        assertThat(shares).extracting(s -> s.amount()).containsExactly(new BigDecimal("10.00"), new BigDecimal("0.00"));
    }

    @Test
    void unCentesimoInDueVaAlPrimoPerId() {
        var shares = WeightedSplitter.split(new BigDecimal("0.01"), w(b, 1, a, 1));
        assertThat(shares).extracting(s -> s.amount()).containsExactly(new BigDecimal("0.01"), new BigDecimal("0.00"));
    }

    @Test
    void sommaPesiZeroDa400() {
        assertThatThrownBy(() -> WeightedSplitter.split(new BigDecimal("10.00"), w(a, 0, b, 0)))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("maggiore di zero");
    }

    @Test
    void laSommaTornaSempreAlTotale() {
        for (String total : List.of("0.01", "0.03", "1.00", "99.99", "12345.67")) {
            for (Object[] weights : List.of(new Object[]{a, "1", b, "1", c, "1"}, new Object[]{a, "2.5", b, "0.5"}, new Object[]{a, "5", b, "3", c, "0"})) {
                var shares = WeightedSplitter.split(new BigDecimal(total), w(weights));
                BigDecimal sum = shares.stream().map(s -> s.amount()).reduce(BigDecimal.ZERO, BigDecimal::add);
                assertThat(sum).isEqualByComparingTo(new BigDecimal(total));
            }
        }
    }

    @Test
    void ilCentesimoDiParitaSegueLOrdineDelTestoDellIdComeNelFrontend() {
        // UUID.compareTo confronta long con segno: 8000… verrebbe prima di 7fff…; l'anteprima del frontend ordina per testo
        UUID low = UUID.fromString("7fffffff-0000-4000-8000-000000000001");
        UUID high = UUID.fromString("80000000-0000-4000-8000-000000000002");
        var shares = WeightedSplitter.split(new BigDecimal("0.01"), w(high, 1, low, 1));
        assertThat(shares).extracting(s -> s.participantId()).containsExactly(low, high);
        assertThat(shares).extracting(s -> s.amount()).containsExactly(new BigDecimal("0.01"), new BigDecimal("0.00"));
    }
}
