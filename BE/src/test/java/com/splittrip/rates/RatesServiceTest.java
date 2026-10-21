package com.splittrip.rates;

import com.splittrip.common.AppException;
import com.splittrip.common.FieldException;
import com.splittrip.common.NotFoundException;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.LocalDate;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class RatesServiceTest {

    static final LocalDate D = LocalDate.of(2026, 10, 20);
    AtomicInteger calls = new AtomicInteger();
    RatesClient ok = (date, from, to) -> { calls.incrementAndGet(); return Optional.of(new RatesClient.Quote(new BigDecimal("0.00562366"), date.minusDays(0))); };
    Clock clock = Clock.fixed(D.atStartOfDay(java.time.ZoneOffset.UTC).toInstant(), java.time.ZoneOffset.UTC);

    @Test
    void cambioEDataDalClientConCachePerGiornoEValute() {
        RatesService s = new RatesService(ok, clock);
        assertThat(s.rate(D, "JPY", "EUR").rate()).isEqualByComparingTo("0.00562366");
        s.rate(D, "JPY", "EUR");
        assertThat(calls.get()).isEqualTo(1);                                   // seconda richiesta uguale: cache
        s.rate(D, "JPY", "CHF");
        assertThat(calls.get()).isEqualTo(2);
    }

    @Test
    void stessaValutaDaUnoSenzaChiamareIlServizio() {
        RatesService s = new RatesService(ok, clock);
        assertThat(s.rate(D, "EUR", "EUR").rate()).isEqualByComparingTo("1");
        assertThat(calls.get()).isZero();
    }

    @Test
    void valutaFuoriListaDa404EServizioGiuDa503() {
        RatesService missing = new RatesService((d, f, t) -> Optional.empty(), clock);
        assertThatThrownBy(() -> missing.rate(D, "MAD", "EUR")).isInstanceOf(NotFoundException.class)
                .hasMessage("Cambio non disponibile per MAD: scrivilo a mano");
        RatesService down = new RatesService((d, f, t) -> { throw new RuntimeException("timeout"); }, clock);
        assertThatThrownBy(() -> down.rate(D, "JPY", "EUR")).isInstanceOfSatisfying(AppException.class,
                e -> assertThat(e.getStatus()).isEqualTo(HttpStatus.SERVICE_UNAVAILABLE));
    }

    @Test
    void codiceNonIsoODataFuturaDa400() {
        RatesService s = new RatesService(ok, clock);
        assertThatThrownBy(() -> s.rate(D, "yen", "EUR")).isInstanceOf(FieldException.class);
        assertThatThrownBy(() -> s.rate(D.plusDays(1), "JPY", "EUR")).isInstanceOf(FieldException.class);   // il cambio di domani non esiste
    }
}
