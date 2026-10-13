package com.splittrip.trip.dto;

import com.splittrip.trip.MemberRole;
import com.splittrip.trip.TripMember;

import java.time.Instant;
import java.util.UUID;

public record MemberResponse(UUID userId, String displayName, MemberRole role, Instant joinedAt) {
    public static MemberResponse from(TripMember m) {
        return new MemberResponse(m.getUser().getId(), m.getUser().getDisplayName(), m.getRole(), m.getJoinedAt());
    }
}
