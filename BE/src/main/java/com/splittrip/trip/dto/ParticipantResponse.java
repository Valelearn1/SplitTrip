package com.splittrip.trip.dto;

import com.splittrip.trip.MemberRole;
import com.splittrip.trip.Participant;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record ParticipantResponse(UUID id, UUID userId, String displayName, MemberRole role, BigDecimal defaultWeight,
                                  LocalDate arrivalDate, LocalDate departureDate) {
    public static ParticipantResponse from(Participant p) {
        return new ParticipantResponse(p.getId(), p.userId(), p.getDisplayName(), p.getRole(), p.getDefaultWeight(),
                p.getArrivalDate(), p.getDepartureDate());
    }
}
