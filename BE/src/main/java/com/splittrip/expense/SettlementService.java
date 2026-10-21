package com.splittrip.expense;

import com.splittrip.common.AmountRules;
import com.splittrip.common.BadRequestException;
import com.splittrip.common.ForbiddenException;
import com.splittrip.common.NotFoundException;
import com.splittrip.common.events.SettlementCreated;
import com.splittrip.expense.dto.SettlementRequest;
import com.splittrip.expense.dto.SettlementResponse;
import com.splittrip.trip.Trip;
import com.splittrip.trip.TripAccessService;
import com.splittrip.trip.Participant;
import com.splittrip.trip.ParticipantRepository;
import com.splittrip.trip.TripRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.util.List;
import java.util.UUID;

@Service
public class SettlementService {

    private final SettlementRepository settlements;
    private final TripRepository trips;
    private final ParticipantRepository participants;
    private final TripAccessService access;
    private final ApplicationEventPublisher events;
    private final Clock clock;

    public SettlementService(SettlementRepository settlements, TripRepository trips, ParticipantRepository participants,
                             TripAccessService access, ApplicationEventPublisher events, Clock clock) {
        this.settlements = settlements;
        this.trips = trips;
        this.participants = participants;
        this.access = access;
        this.events = events;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public List<SettlementResponse> list(UUID tripId, UUID userId) {
        access.requireMember(tripId, userId);
        return settlements.findAllByTripIdWithParticipants(tripId).stream().map(SettlementResponse::from).toList();
    }

    @Transactional
    public SettlementResponse create(UUID tripId, UUID userId, SettlementRequest req) {
        Participant me = access.requireMember(tripId, userId);
        Trip trip = trips.findById(tripId).orElseThrow();
        access.requireWritable(trip);
        if (req.fromParticipantId().equals(req.toParticipantId())) {
            throw new BadRequestException("Chi restituisce e chi riceve devono essere persone diverse");
        }
        Participant from = participants.findByIdAndTripId(req.fromParticipantId(), tripId).filter(p -> !p.hasLeft())
                .orElseThrow(() -> new BadRequestException("Chi restituisce deve far parte del viaggio"));
        Participant to = participants.findByIdAndTripId(req.toParticipantId(), tripId).filter(p -> !p.hasLeft())
                .orElseThrow(() -> new BadRequestException("Chi riceve deve far parte del viaggio"));
        String note = req.note() == null || req.note().isBlank() ? null : req.note().strip();
        AmountRules.Money money = AmountRules.money(req.currency(), req.fxRate(), req.amount(), trip.getCurrency());
        Settlement s = settlements.save(new Settlement(trip, from, to, req.amount(), money.currency(), money.fxRate(), req.date(),
                note, me.getUser(), clock.instant()));
        events.publishEvent(new SettlementCreated(tripId, userId, me.getDisplayName(), from.userId(), from.getDisplayName(),
                to.userId(), to.getDisplayName(), s.getAmount(), s.getCurrency(), s.getAmountBase(), trip.getCurrency()));
        return SettlementResponse.from(s);
    }

    @Transactional
    public void delete(UUID tripId, UUID userId, UUID settlementId) {
        Participant me = access.requireMember(tripId, userId);
        access.requireWritable(trips.findById(tripId).orElseThrow());
        Settlement s = settlements.findByIdAndTripId(settlementId, tripId)
                .orElseThrow(() -> new NotFoundException("Rimborso non trovato"));
        if (!s.getCreatedBy().getId().equals(userId) && !me.isOrganizer()) {
            throw new ForbiddenException("Solo chi ha registrato il rimborso o chi organizza il viaggio può cancellarlo");
        }
        settlements.delete(s); // soft delete
    }
}
