package com.splittrip.trip;

import com.splittrip.auth.CurrentUserId;
import com.splittrip.trip.dto.TripRequest;
import com.splittrip.trip.dto.TripResponse;
import com.splittrip.trip.dto.TripSummaryResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/trips")
public class TripController {

    private final TripService trips;

    public TripController(TripService trips) { this.trips = trips; }

    @GetMapping
    public List<TripSummaryResponse> list(@CurrentUserId UUID userId) {
        return trips.listForUser(userId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TripResponse create(@CurrentUserId UUID userId, @Valid @RequestBody TripRequest req) {
        return trips.create(userId, req);
    }

    @GetMapping("/{tripId}")
    public TripResponse get(@CurrentUserId UUID userId, @PathVariable UUID tripId) {
        return trips.get(tripId, userId);
    }
}
