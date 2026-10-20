package com.splittrip.trip;

import com.splittrip.common.BadRequestException;
import com.splittrip.common.ConflictException;
import com.splittrip.common.FieldException;
import com.splittrip.common.ForbiddenException;
import com.splittrip.common.NotFoundException;
import com.splittrip.expense.ExpenseRepository;
import com.splittrip.expense.ExpenseShareRepository;
import com.splittrip.expense.SettlementRepository;
import com.splittrip.trip.dto.ParticipantPatchRequest;
import com.splittrip.trip.dto.ParticipantRequest;
import com.splittrip.trip.dto.ParticipantResponse;
import com.splittrip.user.UserAvatarRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;
import java.util.UUID;

/** Partecipanti di un viaggio: aggiunta senza account, modifica, uscita, scollegamento (D-30, D-32, D-33). */
@Service
public class ParticipantService {

    private final ParticipantRepository participants;
    private final TripRepository trips;
    private final TripAccessService access;
    private final ExpenseRepository expenses;
    private final ExpenseShareRepository shares;
    private final SettlementRepository settlements;
    private final UserAvatarRepository avatars;
    private final Clock clock;

    public ParticipantService(ParticipantRepository participants, TripRepository trips, TripAccessService access,
                              ExpenseRepository expenses, ExpenseShareRepository shares,
                              SettlementRepository settlements, UserAvatarRepository avatars, Clock clock) {
        this.participants = participants;
        this.trips = trips;
        this.access = access;
        this.expenses = expenses;
        this.shares = shares;
        this.settlements = settlements;
        this.avatars = avatars;
        this.clock = clock;
    }

    @Transactional
    public ParticipantResponse add(UUID tripId, UUID userId, ParticipantRequest req) {
        access.requireOrganizer(tripId, userId);
        Trip trip = trips.findById(tripId).orElseThrow();
        access.requireWritable(trip);
        validateDates(req.arrivalDate(), req.departureDate());
        Participant p = new Participant(trip, null, req.displayName().strip(), MemberRole.MEMBER, clock.instant());
        if (req.defaultWeight() != null) p.setDefaultWeight(req.defaultWeight());
        p.setArrivalDate(req.arrivalDate());
        p.setDepartureDate(req.departureDate());
        return response(participants.save(p));
    }

    @Transactional
    public ParticipantResponse update(UUID tripId, UUID userId, UUID participantId, ParticipantPatchRequest req) {
        Participant me = access.requireMember(tripId, userId);
        Participant target = active(tripId, participantId);
        if (!me.isOrganizer() && !me.getId().equals(target.getId())) {
            throw new ForbiddenException("Puoi modificare solo la tua partecipazione");
        }
        if (req.displayName() != null) target.setDisplayName(req.displayName().strip());
        if (req.defaultWeight() != null) target.setDefaultWeight(req.defaultWeight());
        if (Boolean.TRUE.equals(req.clearDates())) {
            target.setArrivalDate(null);
            target.setDepartureDate(null);
        }
        if (req.arrivalDate() != null) target.setArrivalDate(req.arrivalDate());
        if (req.departureDate() != null) target.setDepartureDate(req.departureDate());
        validateDates(target.getArrivalDate(), target.getDepartureDate());
        return response(target);
    }

    @Transactional
    public void leave(UUID tripId, UUID actorId, UUID participantId) {
        Participant actor = access.requireMember(tripId, actorId);
        Participant target = active(tripId, participantId);
        if (!actor.isOrganizer() && !actor.getId().equals(target.getId())) {
            throw new ForbiddenException("Puoi togliere solo la tua partecipazione");
        }
        if (target.isOrganizer()) {
            throw new ConflictException("Chi organizza non può lasciare il viaggio");
        }
        if (expenses.existsByTripIdAndPayerId(tripId, participantId) || shares.existsByParticipantIdAndExpenseTripId(participantId, tripId)) {
            throw new ConflictException("Il membro ha spese o quote nel viaggio: non si può rimuovere");
        }
        if (settlements.existsByTripIdAndParticipantInvolved(tripId, participantId)) {
            throw new ConflictException("Il membro ha rimborsi nel viaggio: non si può rimuovere");
        }
        target.setLeftAt(clock.instant()); // mai cancellato: il nome resta nei saldi e nel cestino (D-30)
    }

    @Transactional
    public ParticipantResponse unlink(UUID tripId, UUID userId, UUID participantId) {
        access.requireOrganizer(tripId, userId);
        Participant target = active(tripId, participantId);
        if (!target.hasAccount()) {
            throw new BadRequestException("Questo partecipante non ha un account");
        }
        if (target.isOrganizer()) {
            throw new ConflictException("Chi organizza non si può scollegare");
        }
        target.setUser(null); // perde l'accesso; spese, quote e rimborsi restano sul partecipante
        return response(target);
    }

    private Participant active(UUID tripId, UUID participantId) {
        return participants.findByIdAndTripId(participantId, tripId)
                .filter(p -> !p.hasLeft())
                .orElseThrow(() -> new NotFoundException("Partecipante non trovato"));
    }

    private static void validateDates(LocalDate arrival, LocalDate departure) {
        if (arrival != null && departure != null && departure.isBefore(arrival)) {
            throw new FieldException("departureDate", "La partenza non può precedere l'arrivo");
        }
    }

    private ParticipantResponse response(Participant p) {
        return ParticipantResponse.from(p, p.hasAccount() && avatars.existsById(p.userId()));
    }
}
