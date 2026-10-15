package com.splittrip.places;

import com.splittrip.places.dto.Place;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.math.BigDecimal;
import java.net.URI;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/** Photon (OpenStreetMap). Riceve solo il testo cercato; si presenta con uno User-Agent come chiede la policy del servizio. */
public class PhotonPlaceClient implements PlaceSearchClient {

    record Geometry(List<BigDecimal> coordinates) {}
    record Feature(Geometry geometry, Map<String, Object> properties) {}
    record Response(List<Feature> features) {}

    private final RestClient rest;

    public PhotonPlaceClient(RestClient.Builder builder) {
        this.rest = builder.defaultHeader("User-Agent", "SplitTrip (capstone)").build();
    }

    @Override
    public List<Place> search(String query, BigDecimal nearLat, BigDecimal nearLon) {
        UriComponentsBuilder b = UriComponentsBuilder.fromUriString("https://photon.komoot.io/api")
                .queryParam("q", "{q}").queryParam("lang", "it").queryParam("limit", 6);
        if (nearLat != null && nearLon != null) b.queryParam("lat", nearLat).queryParam("lon", nearLon);
        URI uri = b.encode().buildAndExpand(Map.of("q", query)).toUri(); // la codifica del testo è del builder, non nostra
        Response r = rest.get().uri(uri).retrieve().body(Response.class);
        List<Place> out = new ArrayList<>();
        if (r == null || r.features() == null) return out;
        for (Feature f : r.features()) {
            if (f.geometry() == null || f.geometry().coordinates() == null || f.geometry().coordinates().size() < 2) continue;
            Map<String, Object> p = f.properties() == null ? Map.of() : f.properties();
            String name = text(p, "name");
            List<String> parts = new ArrayList<>();
            for (String key : List.of("district", "city", "state", "country")) {
                String v = text(p, key);
                if (v != null && !v.equals(name) && !parts.contains(v)) parts.add(v);
            }
            if (name == null) {
                if (parts.isEmpty()) continue;
                name = parts.removeFirst();
            }
            out.add(new Place(name, String.join(", ", parts), f.geometry().coordinates().get(1), f.geometry().coordinates().get(0)));
        }
        return out;
    }

    private static String text(Map<String, Object> p, String key) {
        Object v = p.get(key);
        return v instanceof String s && !s.isBlank() ? s : null;
    }
}
