package com.splittrip.places;

import com.splittrip.common.AppException;
import com.splittrip.common.FieldException;
import com.splittrip.places.dto.Place;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Collections;
import java.util.Deque;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/** Ricerca luoghi (D-46, servizio D-51): valida, limita, mette in cache; se il servizio non risponde, 503 (D-60). */
@Service
public class PlaceService {

    static final int MIN = 3, MAX = 100, PER_MINUTE = 30, CACHE_SIZE = 500;
    static final Duration CACHE_TTL = Duration.ofHours(24);
    private static final Logger log = LoggerFactory.getLogger(PlaceService.class);

    private record Cached(Instant expiresAt, List<Place> places) {}

    private final PlaceSearchClient client;
    private final Clock clock;
    private final Map<String, Cached> cache = Collections.synchronizedMap(new LinkedHashMap<>(64, 0.75f, true) {
        @Override protected boolean removeEldestEntry(Map.Entry<String, Cached> e) { return size() > CACHE_SIZE; }
    });
    private final Map<UUID, Deque<Instant>> searches = new ConcurrentHashMap<>();

    public PlaceService(PlaceSearchClient client, Clock clock) {
        this.client = client;
        this.clock = clock;
    }

    public List<Place> search(UUID userId, String rawQuery, String near) {
        String query = rawQuery == null ? "" : rawQuery.strip();
        if (query.length() < MIN) throw new FieldException("q", "Scrivi almeno 3 caratteri");
        if (query.length() > MAX) throw new FieldException("q", "Al massimo 100 caratteri");
        BigDecimal[] point = parseNear(near);
        Instant now = clock.instant();
        String key = query.toLowerCase(Locale.ITALIAN).replaceAll("\\s+", " ") + "|" + (point == null ? "" : point[0] + "," + point[1]);
        Cached hit = cache.get(key);
        if (hit != null && hit.expiresAt().isAfter(now)) return hit.places();
        if (!allow(userId, now)) throw new AppException(HttpStatus.TOO_MANY_REQUESTS, "Troppe ricerche", "Troppe ricerche, riprova tra poco");
        try {
            List<Place> found = client.search(query, point == null ? null : point[0], point == null ? null : point[1]);
            cache.put(key, new Cached(now.plus(CACHE_TTL), found));
            return found;
        } catch (RuntimeException e) {
            // D-60: 503, non una lista vuota, così il modulo distingue «nessun risultato» da «servizio giù»
            log.warn("Ricerca luoghi non disponibile: {}", e.getMessage());
            throw new AppException(HttpStatus.SERVICE_UNAVAILABLE, "Luoghi non disponibili", "Ricerca dei luoghi non disponibile, riprova tra poco");
        }
    }

    /** «lat,lon» → coppia; qualsiasi altra cosa → null (si cerca senza vicinanza). */
    private static BigDecimal[] parseNear(String near) {
        if (near == null) return null;
        String[] parts = near.split(",");
        if (parts.length != 2) return null;
        try {
            BigDecimal lat = new BigDecimal(parts[0].strip()), lon = new BigDecimal(parts[1].strip());
            if (lat.abs().compareTo(BigDecimal.valueOf(90)) > 0 || lon.abs().compareTo(BigDecimal.valueOf(180)) > 0) return null;
            return new BigDecimal[] {lat, lon};
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private boolean allow(UUID userId, Instant now) {
        Deque<Instant> times = searches.computeIfAbsent(userId, k -> new ArrayDeque<>());
        synchronized (times) {
            while (!times.isEmpty() && !times.peekFirst().isAfter(now.minus(Duration.ofMinutes(1)))) times.pollFirst();
            if (times.size() >= PER_MINUTE) return false;
            times.addLast(now);
            return true;
        }
    }
}
