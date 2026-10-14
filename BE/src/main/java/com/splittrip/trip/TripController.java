package com.splittrip.trip;

import com.splittrip.auth.CurrentUserId;
import com.splittrip.trip.dto.JoinPreviewResponse;
import com.splittrip.trip.dto.JoinRequest;
import com.splittrip.trip.dto.TripPatchRequest;
import com.splittrip.trip.dto.TripRequest;
import com.splittrip.trip.dto.TripResponse;
import com.splittrip.trip.dto.TripSummaryResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
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

    // Mapping con percorso fisso prima di quelli con {tripId}
    @GetMapping("/join-preview")
    public JoinPreviewResponse joinPreview(@RequestParam String code) {
        return trips.joinPreview(code);
    }

    @PostMapping("/join")
    public TripResponse join(@CurrentUserId UUID userId, @Valid @RequestBody JoinRequest req) {
        return trips.join(userId, req.code(), req.participantId());
    }

    @GetMapping("/{tripId}")
    public TripResponse get(@CurrentUserId UUID userId, @PathVariable UUID tripId) {
        return trips.get(tripId, userId);
    }

    @PatchMapping("/{tripId}")
    public TripResponse update(@CurrentUserId UUID userId, @PathVariable UUID tripId,
                               @Valid @RequestBody TripPatchRequest req) {
        return trips.update(tripId, userId, req);
    }

    @DeleteMapping("/{tripId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@CurrentUserId UUID userId, @PathVariable UUID tripId) {
        trips.delete(tripId, userId);
    }

    @PostMapping("/{tripId}/invite-code/regenerate")
    public TripResponse regenerate(@CurrentUserId UUID userId, @PathVariable UUID tripId) {
        return trips.regenerateInviteCode(tripId, userId);
    }
}
