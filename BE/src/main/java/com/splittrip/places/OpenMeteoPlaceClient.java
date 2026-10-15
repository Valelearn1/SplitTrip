package com.splittrip.places;

import com.splittrip.places.dto.Place;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.math.BigDecimal;
import java.net.URI;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;

/**
 * Geocoding di Open-Meteo (D-51): veloce, in italiano, lo stesso servizio del meteo. Trova città, paesi e quartieri.
 * Riceve solo il testo cercato; «vicino a» lo applichiamo noi ordinando per distanza.
 */
public class OpenMeteoPlaceClient implements PlaceSearchClient {

    static final int ASK = 10, KEEP = 6;

    record Result(String name, BigDecimal latitude, BigDecimal longitude, String admin1, String country) {}
    record Response(List<Result> results) {}

    private final RestClient rest;

    public OpenMeteoPlaceClient(RestClient.Builder builder) {
        this.rest = builder.defaultHeader("User-Agent", "SplitTrip (capstone)").build();
    }

    @Override
    public List<Place> search(String query, BigDecimal nearLat, BigDecimal nearLon) {
        URI uri = UriComponentsBuilder.fromUriString("https://geocoding-api.open-meteo.com/v1/search")
                .queryParam("name", "{q}").queryParam("count", ASK).queryParam("language", "it").queryParam("format", "json")
                .encode().buildAndExpand(Map.of("q", query)).toUri(); // la codifica del testo è del builder, non nostra
        Response r = rest.get().uri(uri).retrieve().body(Response.class);
        if (r == null || r.results() == null) return List.of();
        List<Result> results = new ArrayList<>(r.results().stream()
                .filter(x -> x.name() != null && x.latitude() != null && x.longitude() != null).toList());
        if (nearLat != null && nearLon != null) results.sort(Comparator.comparingDouble(x -> distance(x, nearLat, nearLon)));
        return results.stream().limit(KEEP).map(OpenMeteoPlaceClient::toPlace).toList();
    }

    /** Dettaglio breve: regione e paese. La regione arriva tradotta, il comune (admin2) spesso no («Lisbon»). */
    private static Place toPlace(Result x) {
        String local = x.admin1() != null && !x.admin1().equals(x.name()) ? x.admin1() : null;
        List<String> parts = new ArrayList<>();
        for (String p : new String[] {local, x.country()}) if (p != null && !p.isBlank() && !parts.contains(p)) parts.add(p);
        return new Place(x.name(), String.join(", ", parts.stream().filter(Objects::nonNull).toList()), x.latitude(), x.longitude());
    }

    /** Solo per ordinare: distanza approssimata in gradi, con la longitudine corretta per la latitudine. */
    private static double distance(Result x, BigDecimal lat, BigDecimal lon) {
        double dLat = x.latitude().doubleValue() - lat.doubleValue();
        double dLon = (x.longitude().doubleValue() - lon.doubleValue()) * Math.cos(Math.toRadians(lat.doubleValue()));
        return dLat * dLat + dLon * dLon;
    }
}
