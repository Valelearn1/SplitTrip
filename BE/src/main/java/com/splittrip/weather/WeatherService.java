package com.splittrip.weather;

import com.splittrip.trip.Trip;
import com.splittrip.trip.TripAccessService;
import com.splittrip.trip.TripRepository;
import com.splittrip.weather.OpenMeteoClient.Coordinates;
import com.splittrip.weather.OpenMeteoClient.DayForecast;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Meteo della destinazione (D-37). Le previsioni restano in memoria 1 ora per viaggio; se Open-Meteo
 * non risponde la risposta è vuota (in cache 10 minuti, per non insistere) e la panoramica si apre lo stesso.
 */
@Service
public class WeatherService {

    private static final Logger log = LoggerFactory.getLogger(WeatherService.class);
    private static final Duration TTL = Duration.ofHours(1);
    private static final Duration FAILURE_TTL = Duration.ofMinutes(10);

    private record Cached(Instant expiresAt, List<DayForecast> days) {}

    private final OpenMeteoClient openMeteo;
    private final TripRepository trips;
    private final TripAccessService access;
    private final Clock clock;
    private final Map<UUID, Cached> cache = new ConcurrentHashMap<>();

    public WeatherService(OpenMeteoClient openMeteo, TripRepository trips, TripAccessService access, Clock clock) {
        this.openMeteo = openMeteo;
        this.trips = trips;
        this.access = access;
        this.clock = clock;
    }

    public List<DayForecast> forecast(UUID tripId, UUID userId) {
        access.requireMember(tripId, userId);
        Instant now = clock.instant();
        Cached hit = cache.get(tripId);
        if (hit != null && hit.expiresAt().isAfter(now)) return hit.days();

        Trip trip = trips.findById(tripId).orElseThrow();
        try {
            Optional<Coordinates> where = coordinates(trip);
            List<DayForecast> days = where
                    .map(c -> openMeteo.forecast(c.latitude(), c.longitude()))
                    .orElse(List.of())
                    .stream()
                    .filter(d -> !d.date().isBefore(trip.getStartDate()) && !d.date().isAfter(trip.getEndDate()))
                    .toList();
            cache.put(tripId, new Cached(now.plus(TTL), days));
            return days;
        } catch (RuntimeException e) {
            log.warn("Meteo non disponibile per il viaggio {}: {}", tripId, e.getMessage());
            cache.put(tripId, new Cached(now.plus(FAILURE_TTL), List.of()));
            return List.of();
        }
    }

    /** Coordinate salvate sul viaggio; al primo uso le chiede al geocoding e le salva. */
    private Optional<Coordinates> coordinates(Trip trip) {
        if (trip.getLatitude() != null && trip.getLongitude() != null) {
            return Optional.of(new Coordinates(trip.getLatitude(), trip.getLongitude()));
        }
        Optional<Coordinates> found = openMeteo.geocode(trip.getDestination());
        found.ifPresent(c -> {
            trip.setLatitude(c.latitude());
            trip.setLongitude(c.longitude());
            trips.save(trip);
        });
        return found;
    }
}
