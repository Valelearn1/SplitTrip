package com.splittrip.rates;

import org.junit.jupiter.api.Test;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.hamcrest.Matchers.startsWith;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.queryParam;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

/** D-69: tassi BCE contro l'euro e rapporto calcolato da noi, 8 decimali; la data è quella del tasso usato. */
class FrankfurterRatesClientTest {

    RestClient.Builder builder = RestClient.builder();
    MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
    FrankfurterRatesClient client = new FrankfurterRatesClient(builder);

    @Test
    void rapportoDaiTassiControLEuroConLaDataDelTasso() {
        server.expect(requestTo(startsWith("https://api.frankfurter.dev/v1/2026-10-18")))
                .andExpect(queryParam("base", "EUR")).andExpect(queryParam("symbols", "JPY,EUR"))
                .andRespond(withSuccess("""
                        {"amount":1.0,"base":"EUR","date":"2026-10-16","rates":{"JPY":177.82}}
                        """, APPLICATION_JSON));
        Optional<RatesClient.Quote> q = client.rate(LocalDate.of(2026, 10, 18), "JPY", "EUR");
        assertThat(q).isPresent();
        assertThat(q.get().rate()).isEqualByComparingTo("0.00562366");     // 1 / 177.82, 8 decimali HALF_UP
        assertThat(q.get().date()).isEqualTo(LocalDate.of(2026, 10, 16));   // domenica → venerdì (BCE)
    }

    @Test
    void daEuroAYenEDaYenAFranchi() {
        server.expect(requestTo(startsWith("https://api.frankfurter.dev/v1/2026-10-20")))
                .andRespond(withSuccess("""
                        {"amount":1.0,"base":"EUR","date":"2026-10-20","rates":{"JPY":177.82,"CHF":0.93}}
                        """, APPLICATION_JSON));
        assertThat(client.rate(LocalDate.of(2026, 10, 20), "EUR", "JPY").get().rate()).isEqualByComparingTo("177.82000000");
        server.reset();
        server.expect(requestTo(startsWith("https://api.frankfurter.dev/v1/2026-10-20")))
                .andRespond(withSuccess("""
                        {"amount":1.0,"base":"EUR","date":"2026-10-20","rates":{"JPY":177.82,"CHF":0.93}}
                        """, APPLICATION_JSON));
        assertThat(client.rate(LocalDate.of(2026, 10, 20), "JPY", "CHF").get().rate()).isEqualByComparingTo("0.00523001");   // 0.93 / 177.82
    }

    @Test
    void valutaAssenteDallaRispostaDaVuoto() {                               // Review Focus 4
        server.expect(requestTo(startsWith("https://api.frankfurter.dev/v1/2026-10-20")))
                .andRespond(withSuccess("""
                        {"amount":1.0,"base":"EUR","date":"2026-10-20","rates":{"JPY":177.82}}
                        """, APPLICATION_JSON));
        assertThat(client.rate(LocalDate.of(2026, 10, 20), "MAD", "EUR")).isEmpty();
    }

    @Test
    void servizioGiuLanciaUnEccezione() {
        server.expect(requestTo(startsWith("https://api.frankfurter.dev/v1/2026-10-20"))).andRespond(withServerError());
        assertThatThrownBy(() -> client.rate(LocalDate.of(2026, 10, 20), "JPY", "EUR")).isInstanceOf(RuntimeException.class);
    }
}
