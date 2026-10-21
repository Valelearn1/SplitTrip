package com.splittrip.rates;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

/** Cambio da→a per una data; vuoto se una delle due valute non è nella lista del servizio. Il servizio giù lancia. */
public interface RatesClient {
    record Quote(BigDecimal rate, LocalDate date) {}
    Optional<Quote> rate(LocalDate date, String from, String to);
}
