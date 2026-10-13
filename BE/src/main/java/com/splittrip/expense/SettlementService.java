package com.splittrip.expense;

import com.splittrip.common.BadRequestException;
import com.splittrip.common.ForbiddenException;
import com.splittrip.common.NotFoundException;
import com.splittrip.expense.dto.SettlementRequest;
import com.splittrip.expense.dto.SettlementResponse;
import com.splittrip.trip.Trip;
import com.splittrip.trip.TripAccessService;
import com.splittrip.trip.TripMember;
import com.splittrip.trip.TripMemberRepository;
import com.splittrip.trip.TripRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.util.List;
import java.util.UUID;

@Service
public class SettlementService {

    private final SettlementRepository settlements;
    private final TripRepository trips;
    private final TripMemberRepository members;
    private final TripAccessService access;
    private final Clock clock;

    public SettlementService(SettlementRepository settlements, TripRepository trips, TripMemberRepository members,
                             TripAccessService access, Clock clock) {
        this.settlements = settlements;
        this.trips = trips;
        this.members = members;
        this.access = access;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public List<SettlementResponse> list(UUID tripId, UUID userId) {
        access.requireMember(tripId, userId);
        return settlements.findAllByTripIdWithUsers(tripId).stream().map(SettlementResponse::from).toList();
    }

    @Transactional
    public SettlementResponse create(UUID tripId, UUID userId, SettlementRequest req) {
        TripMember me = access.requireMember(tripId, userId);
        Trip trip = trips.findById(tripId).orElseThrow();
        access.requireWritable(trip);
        if (req.fromUserId().equals(req.toUserId())) {
            throw new BadRequestException("Chi restituisce e chi riceve devono essere persone diverse");
        }
        TripMember from = members.findByTripIdAndUserId(tripId, req.fromUserId())
                .orElseThrow(() -> new BadRequestException("Chi restituisce deve far parte del viaggio"));
        TripMember to = members.findByTripIdAndUserId(tripId, req.toUserId())
                .orElseThrow(() -> new BadRequestException("Chi riceve deve far parte del viaggio"));
        String note = req.note() == null || req.note().isBlank() ? null : req.note().strip();
        Settlement s = settlements.save(new Settlement(trip, from.getUser(), to.getUser(), req.amount(), req.date(),
                note, me.getUser(), clock.instant()));
        return SettlementResponse.from(s);
    }

    @Transactional
    public void delete(UUID tripId, UUID userId, UUID settlementId) {
        TripMember me = access.requireMember(tripId, userId);
        access.requireWritable(trips.findById(tripId).orElseThrow());
        Settlement s = settlements.findByIdAndTripId(settlementId, tripId)
                .orElseThrow(() -> new NotFoundException("Rimborso non trovato"));
        if (!s.getCreatedBy().getId().equals(userId) && !me.isOrganizer()) {
            throw new ForbiddenException("Solo chi ha registrato il rimborso o l'organizzatore può cancellarlo");
        }
        settlements.delete(s); // soft delete
    }
}
