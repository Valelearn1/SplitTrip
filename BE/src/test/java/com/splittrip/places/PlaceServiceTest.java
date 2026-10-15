package com.splittrip.places;

import com.splittrip.common.AppException;
import com.splittrip.common.FieldException;
import com.splittrip.places.dto.Place;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class PlaceServiceTest {

    static final Place LISBONA = new Place("Lisbona", "Portogallo", new BigDecimal("38.7169"), new BigDecimal("-9.1399"));
    AtomicInteger calls = new AtomicInteger();
    PlaceSearchClient client = (q, lat, lon) -> { calls.incrementAndGet(); return List.of(LISBONA); };
    Clock clock = Clock.fixed(Instant.parse("2026-11-01T10:00:00Z"), ZoneOffset.UTC);
    PlaceService service = new PlaceService(client, clock);
    UUID vale = UUID.randomUUID();

    @Test
    void testoTroppoCortoOTroppoLungoDa400() {
        assertThatThrownBy(() -> service.search(vale, "li", null)).isInstanceOf(FieldException.class);
        assertThatThrownBy(() -> service.search(vale, "x".repeat(101), null)).isInstanceOf(FieldException.class);
        assertThat(service.search(vale, " lis ", null)).containsExactly(LISBONA);          // 3 dopo strip
        assertThat(service.search(vale, "x".repeat(100), null)).containsExactly(LISBONA);  // Review Focus 1: 100 caratteri ok
    }

    @Test
    void laCacheEvitaLaSecondaChiamataUguale() {
        service.search(vale, "Lisbona", null);
        service.search(UUID.randomUUID(), "lisbona ", null); // stessa ricerca (senza maiuscole e spazi), altro utente
        assertThat(calls.get()).isEqualTo(1);
        service.search(vale, "Lisbona", "38.72,-9.14");      // con «vicino a» è un'altra chiave
        assertThat(calls.get()).isEqualTo(2);
    }

    @Test
    void servizioGiuDaListaVuota() {
        PlaceService broken = new PlaceService((q, lat, lon) -> { throw new RuntimeException("timeout"); }, clock);
        assertThat(broken.search(vale, "Lisbona", null)).isEmpty();
    }

    @Test
    void nearMalformatoVieneIgnorato() {
        assertThat(service.search(vale, "Lisbona", "abc")).containsExactly(LISBONA);
    }

    @Test
    void laTrentunesimaRicercaAlMinutoDa429() {
        for (int i = 0; i < 30; i++) service.search(vale, "luogo " + i, null);
        assertThatThrownBy(() -> service.search(vale, "luogo 31", null))
                .isInstanceOf(AppException.class).hasMessage("Troppe ricerche, riprova tra poco");
        assertThat(service.search(UUID.randomUUID(), "luogo 31", null)).isNotEmpty(); // gli altri non sono toccati
    }
}
