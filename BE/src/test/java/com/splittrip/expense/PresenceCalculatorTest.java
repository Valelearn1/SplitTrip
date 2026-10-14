package com.splittrip.expense;

import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

class PresenceCalculatorTest {

    LocalDate start = LocalDate.of(2026, 10, 1), end = LocalDate.of(2026, 10, 6);

    @Test
    void tuttoIlViaggioSeLeDateSonoNulle() {
        assertThat(PresenceCalculator.count(start, end, null, null, DayBasis.DAYS)).isEqualTo(6);
        assertThat(PresenceCalculator.count(start, end, null, null, DayBasis.NIGHTS)).isEqualTo(5);
    }

    @Test
    void chiArrivaDopoContaDalSuoArrivo() {
        LocalDate arrival = LocalDate.of(2026, 10, 3);
        assertThat(PresenceCalculator.count(start, end, arrival, null, DayBasis.DAYS)).isEqualTo(4);
        assertThat(PresenceCalculator.count(start, end, arrival, null, DayBasis.NIGHTS)).isEqualTo(3);
    }

    @Test
    void leDateFuoriDalViaggioVengonoTagliate() {
        assertThat(PresenceCalculator.count(start, end, LocalDate.of(2026, 9, 20), LocalDate.of(2026, 10, 20), DayBasis.NIGHTS)).isEqualTo(5);
    }

    @Test
    void unaGiornataSolaVale1GiornoE0Notti() {
        LocalDate d = LocalDate.of(2026, 10, 2);
        assertThat(PresenceCalculator.count(start, end, d, d, DayBasis.DAYS)).isEqualTo(1);
        assertThat(PresenceCalculator.count(start, end, d, d, DayBasis.NIGHTS)).isEqualTo(0);
    }

    @Test
    void arrivoDopoLaFineOIntervalloInvertitoDanno0() {
        assertThat(PresenceCalculator.count(start, end, LocalDate.of(2026, 10, 7), null, DayBasis.DAYS)).isEqualTo(0);
        assertThat(PresenceCalculator.count(start, end, LocalDate.of(2026, 10, 4), LocalDate.of(2026, 10, 2), DayBasis.NIGHTS)).isEqualTo(0);
    }
}
