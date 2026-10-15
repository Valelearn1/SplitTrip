package com.splittrip.places;

import com.splittrip.places.dto.Place;

import java.math.BigDecimal;
import java.util.List;

/** Ricerca luoghi dietro un'interfaccia (D-46): nei test si sostituisce con una lambda. */
@FunctionalInterface
public interface PlaceSearchClient {
    List<Place> search(String query, BigDecimal nearLat, BigDecimal nearLon);
}
