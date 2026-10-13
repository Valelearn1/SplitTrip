package com.splittrip.trip;

import com.splittrip.common.ConflictException;
import com.splittrip.common.ForbiddenException;
import com.splittrip.common.NotFoundException;
import org.springframework.stereotype.Service;

import java.util.UUID;

/** Ogni service che lavora su un viaggio inizia da qui: chi sei e cosa puoi fare. */
@Service
public class TripAccessService {

    private final TripRepository trips;
    private final TripMemberRepository members;

    public TripAccessService(TripRepository trips, TripMemberRepository members) {
        this.trips = trips;
        this.members = members;
    }

    public TripMember requireMember(UUID tripId, UUID userId) {
        if (!trips.existsById(tripId)) {
            throw new NotFoundException("Viaggio non trovato");
        }
        return members.findByTripIdAndUserId(tripId, userId)
                .orElseThrow(() -> new ForbiddenException("Non fai parte di questo viaggio"));
    }

    public TripMember requireOrganizer(UUID tripId, UUID userId) {
        TripMember m = requireMember(tripId, userId);
        if (!m.isOrganizer()) {
            throw new ForbiddenException("Solo l'organizzatore può farlo");
        }
        return m;
    }

    public void requireWritable(Trip trip) {
        if (trip.getStatus() == TripStatus.CLOSED) {
            throw new ConflictException("Il viaggio è chiuso: non si possono fare modifiche");
        }
    }
}
