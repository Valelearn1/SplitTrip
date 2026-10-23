package com.splittrip.trip.dto;

import com.splittrip.trip.Trip;
import com.splittrip.trip.Participant;
import com.splittrip.trip.TripStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.UUID;

public record TripResponse(UUID id, String name, String destination, LocalDate startDate, LocalDate endDate,
                           String currency, TripStatus status, BigDecimal latitude, BigDecimal longitude, String inviteCode, UUID ownerId,
                           List<ParticipantResponse> participants, UUID coverPhotoId) {
    public static TripResponse from(Trip t, List<Participant> participants, Set<UUID> usersWithAvatar) {
        return new TripResponse(t.getId(), t.getName(), t.getDestination(), t.getStartDate(), t.getEndDate(),
                t.getCurrency(), t.getStatus(), t.getLatitude(), t.getLongitude(), t.getInviteCode(), t.getOwner().getId(),
                participants.stream().map(p -> ParticipantResponse.from(p, p.hasAccount() && usersWithAvatar.contains(p.userId()))).toList(),
                t.getCoverPhotoId());
    }
}
