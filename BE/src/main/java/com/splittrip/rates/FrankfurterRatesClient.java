package com.splittrip.rates;

import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URI;
import java.time.LocalDate;
import java.util.Map;
import java.util.Optional;

/**
 * Frankfurter (dati BCE, D-69): tassi contro l'euro e rapporto calcolato da noi. Il cambio diretto del servizio ha
 * solo 3 cifre significative (1 JPY = 0.00564 EUR): su 100.000 yen sbaglia di mezzo euro.
 */
public class FrankfurterRatesClient implements RatesClient {

    record Response(LocalDate date, Map<String, BigDecimal> rates) {}

    private final RestClient rest;

    public FrankfurterRatesClient(RestClient.Builder builder) {
        this.rest = builder.defaultHeader("User-Agent", "SplitTrip (capstone)").build();
    }

    @Override
    public Optional<Quote> rate(LocalDate date, String from, String to) {
        URI uri = URI.create("https://api.frankfurter.dev/v1/" + date + "?base=EUR&symbols=" + from + "," + to);
        Response r = rest.get().uri(uri).retrieve().body(Response.class);
        if (r == null || r.rates() == null) return Optional.empty();
        BigDecimal fromRate = "EUR".equals(from) ? BigDecimal.ONE : r.rates().get(from);
        BigDecimal toRate = "EUR".equals(to) ? BigDecimal.ONE : r.rates().get(to);
        if (fromRate == null || toRate == null || fromRate.signum() == 0) return Optional.empty();
        return Optional.of(new Quote(toRate.divide(fromRate, 8, RoundingMode.HALF_UP), r.date()));
    }
}
