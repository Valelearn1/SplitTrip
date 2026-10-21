package com.splittrip.rates;

import com.splittrip.common.AppException;
import com.splittrip.common.FieldException;
import com.splittrip.common.NotFoundException;
import com.splittrip.rates.dto.RateResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.LocalDate;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Pattern;

/** Cambio del giorno (D-69): valida, mette in cache per (data, da, a); valuta fuori lista → 404, servizio giù → 503. */
@Service
public class RatesService {

    static final int CACHE_SIZE = 2000;
    private static final Pattern ISO = Pattern.compile("^[A-Z]{3}$");
    private static final Logger log = LoggerFactory.getLogger(RatesService.class);

    private final RatesClient client;
    private final Clock clock;
    private final Map<String, RateResponse> cache = Collections.synchronizedMap(new LinkedHashMap<>(64, 0.75f, true) {
        @Override protected boolean removeEldestEntry(Map.Entry<String, RateResponse> e) { return size() > CACHE_SIZE; }
    });

    public RatesService(RatesClient client, Clock clock) {
        this.client = client;
        this.clock = clock;
    }

    public RateResponse rate(LocalDate date, String from, String to) {
        if (from == null || !ISO.matcher(from).matches()) throw new FieldException("from", "Valuta in formato ISO a 3 lettere");
        if (to == null || !ISO.matcher(to).matches()) throw new FieldException("to", "Valuta in formato ISO a 3 lettere");
        if (date == null) throw new FieldException("date", "Scegli una data");
        // la data arriva dal telefono, il server è in UTC: a Tokyo «oggi» è già domani (revisione v3.6)
        if (date.isAfter(LocalDate.now(clock).plusDays(1))) throw new FieldException("date", "Il cambio di una data futura non esiste ancora");
        if (from.equals(to)) return new RateResponse(BigDecimal.ONE, date);
        String key = date + "|" + from + "|" + to;
        RateResponse hit = cache.get(key);
        if (hit != null) return hit;
        Optional<RatesClient.Quote> quote;
        try {
            quote = client.rate(date, from, to);
        } catch (RuntimeException e) {
            log.warn("Cambi non disponibili: {}", e.getMessage());
            throw new AppException(HttpStatus.SERVICE_UNAVAILABLE, "Cambi non disponibili", "Servizio dei cambi non disponibile: scrivi il cambio a mano");
        }
        RateResponse r = quote.map(q -> new RateResponse(q.rate(), q.date()))
                .orElseThrow(() -> new NotFoundException("Cambio non disponibile per " + from + ": scrivilo a mano"));
        cache.put(key, r);
        return r;
    }
}
