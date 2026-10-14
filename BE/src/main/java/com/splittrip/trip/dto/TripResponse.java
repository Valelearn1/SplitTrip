package com.splittrip.trip.dto;

import com.splittrip.trip.Trip;
import com.splittrip.trip.Participant;
import com.splittrip.trip.TripStatus;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record TripResponse(UUID id, String name, String destination, LocalDate startDate, LocalDate endDate,
                           String currency, TripStatus status, String inviteCode, UUID ownerId,
                           List<ParticipantResponse> participants) {
    public static TripResponse from(Trip t, List<Participant> participants) {
        return new TripResponse(t.getId(), t.getName(), t.getDestination(), t.getStartDate(), t.getEndDate(),
                t.getCurrency(), t.getStatus(), t.getInviteCode(), t.getOwner().getId(),
                participants.stream().map(ParticipantResponse::from).toList());
    }
}
