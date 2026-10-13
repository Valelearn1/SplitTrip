package com.splittrip.trip.dto;

import com.splittrip.trip.Trip;
import com.splittrip.trip.TripMember;
import com.splittrip.trip.TripStatus;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record TripResponse(UUID id, String name, String destination, LocalDate startDate, LocalDate endDate,
                           String currency, TripStatus status, String inviteCode, UUID ownerId,
                           List<MemberResponse> members) {
    public static TripResponse from(Trip t, List<TripMember> members) {
        return new TripResponse(t.getId(), t.getName(), t.getDestination(), t.getStartDate(), t.getEndDate(),
                t.getCurrency(), t.getStatus(), t.getInviteCode(), t.getOwner().getId(),
                members.stream().map(MemberResponse::from).toList());
    }
}
