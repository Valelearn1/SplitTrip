package com.splittrip.trip;

import com.splittrip.common.BadRequestException;
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
    private final Clock clock;

    public TripService(TripRepository trips, TripMemberRepository members, UserService users,
                       TripAccessService access, InviteCodeGenerator codes, Clock clock) {
        this.trips = trips;
        this.members = members;
        this.users = users;
        this.access = access;
        this.codes = codes;
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
