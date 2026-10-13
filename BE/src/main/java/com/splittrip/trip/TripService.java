package com.splittrip.trip;

import com.splittrip.common.BadRequestException;
import com.splittrip.common.ConflictException;
import com.splittrip.common.ForbiddenException;
import com.splittrip.common.NotFoundException;
import com.splittrip.expense.ExpenseRepository;
import com.splittrip.expense.ExpenseShareRepository;
import com.splittrip.trip.dto.JoinPreviewResponse;
import com.splittrip.trip.dto.TripPatchRequest;
import com.splittrip.trip.dto.TripRequest;
import com.splittrip.trip.dto.TripResponse;
import com.splittrip.trip.dto.TripSummaryResponse;
import com.splittrip.user.User;
import com.splittrip.user.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class TripService {

    private final TripRepository trips;
    private final TripMemberRepository members;
    private final UserService users;
    private final TripAccessService access;
    private final InviteCodeGenerator codes;
    private final ExpenseRepository expenses;
    private final ExpenseShareRepository shares;
    private final Clock clock;

    public TripService(TripRepository trips, TripMemberRepository members, UserService users,
                       TripAccessService access, InviteCodeGenerator codes,
                       ExpenseRepository expenses, ExpenseShareRepository shares, Clock clock) {
        this.trips = trips;
        this.members = members;
        this.users = users;
        this.access = access;
        this.codes = codes;
        this.expenses = expenses;
        this.shares = shares;
        this.clock = clock;
    }

    @Transactional
    public TripResponse create(UUID userId, TripRequest req) {
        validateDates(req.startDate(), req.endDate());
        User owner = users.require(userId);
        Instant now = clock.instant();
        String currency = req.currency() == null ? "EUR" : req.currency();
        Trip trip = trips.save(new Trip(req.name().strip(), req.destination().strip(), req.startDate(), req.endDate(),
                currency, uniqueCode(), owner, now));
        members.save(new TripMember(trip, owner, MemberRole.ORGANIZER, now));
        return get(trip.getId(), userId);
    }

    @Transactional(readOnly = true)
    public List<TripSummaryResponse> listForUser(UUID userId) {
        return trips.findAllByMemberUserId(userId).stream()
                .map(t -> new TripSummaryResponse(t.getId(), t.getName(), t.getDestination(), t.getStartDate(),
                        t.getEndDate(), t.getCurrency(), t.getStatus(), members.countByTripId(t.getId()),
                        members.findByTripIdAndUserId(t.getId(), userId).map(TripMember::getRole).orElse(MemberRole.MEMBER)))
                .toList();
    }

    @Transactional(readOnly = true)
    public TripResponse get(UUID tripId, UUID userId) {
        access.requireMember(tripId, userId);
        Trip trip = trips.findById(tripId).orElseThrow();
        return TripResponse.from(trip, members.findByTripIdOrderByJoinedAtAsc(tripId));
    }

    @Transactional
    public TripResponse update(UUID tripId, UUID userId, TripPatchRequest req) {
        access.requireOrganizer(tripId, userId);
        Trip trip = trips.findById(tripId).orElseThrow();
        if (req.name() != null) trip.setName(req.name().strip());
        if (req.destination() != null) trip.setDestination(req.destination().strip());
        if (req.startDate() != null) trip.setStartDate(req.startDate());
        if (req.endDate() != null) trip.setEndDate(req.endDate());
        validateDates(trip.getStartDate(), trip.getEndDate());
        if (req.status() != null) {
            if (req.status().ordinal() < trip.getStatus().ordinal()) {
                throw new ConflictException("Lo stato del viaggio può solo avanzare");
            }
            trip.setStatus(req.status());
        }
        trip.setUpdatedAt(clock.instant());
        return get(tripId, userId);
    }

    @Transactional
    public void delete(UUID tripId, UUID userId) {
        access.requireOrganizer(tripId, userId);
        Trip trip = trips.findById(tripId).orElseThrow();
        if (trip.getStatus() != TripStatus.PLANNING) {
            throw new ConflictException("Si può cancellare solo un viaggio in pianificazione");
        }
        if (expenses.existsByTripId(tripId)) {
            throw new ConflictException("Il viaggio ha delle spese: non si può cancellare");
        }
        trips.delete(trip);
    }

    @Transactional(readOnly = true)
    public JoinPreviewResponse joinPreview(String code) {
        Trip trip = findByCode(code);
        return new JoinPreviewResponse(trip.getName(), trip.getDestination(), trip.getStartDate(), trip.getEndDate(),
                members.countByTripId(trip.getId()));
    }

    @Transactional
    public TripResponse join(UUID userId, String code) {
        Trip trip = findByCode(code);
        if (!members.existsByTripIdAndUserId(trip.getId(), userId)) {
            access.requireWritable(trip);
            members.save(new TripMember(trip, users.require(userId), MemberRole.MEMBER, clock.instant()));
        }
        return get(trip.getId(), userId);
    }

    @Transactional
    public TripResponse regenerateInviteCode(UUID tripId, UUID userId) {
        access.requireOrganizer(tripId, userId);
        Trip trip = trips.findById(tripId).orElseThrow();
        trip.setInviteCode(uniqueCode());
        trip.setUpdatedAt(clock.instant());
        return get(tripId, userId);
    }

    @Transactional
    public void removeMember(UUID tripId, UUID actorId, UUID targetUserId) {
        TripMember actor = access.requireMember(tripId, actorId);
        if (!actor.isOrganizer() && !actorId.equals(targetUserId)) {
            throw new ForbiddenException("Puoi rimuovere solo te stesso");
        }
        TripMember target = members.findByTripIdAndUserId(tripId, targetUserId)
                .orElseThrow(() -> new NotFoundException("Membro non trovato"));
        if (target.isOrganizer()) {
            throw new ConflictException("L'organizzatore non può lasciare il viaggio");
        }
        if (expenses.existsByTripIdAndPayerId(tripId, targetUserId) || shares.existsByUserIdAndExpenseTripId(targetUserId, tripId)) {
            throw new ConflictException("Il membro ha spese o quote nel viaggio: non si può rimuovere");
        }
        members.delete(target);
    }

    private Trip findByCode(String code) {
        return trips.findByInviteCode(InviteCodeGenerator.normalize(code))
                .orElseThrow(() -> new NotFoundException("Codice invito non valido"));
    }

    String uniqueCode() {
        String code;
        do {
            code = codes.generate();
        } while (trips.existsByInviteCode(code));
        return code;
    }

    static void validateDates(LocalDate start, LocalDate end) {
        if (end.isBefore(start)) {
            throw new BadRequestException("La data di fine deve essere uguale o successiva a quella di inizio");
        }
    }
}
