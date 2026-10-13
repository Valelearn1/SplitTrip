package com.splittrip.trip;

import com.splittrip.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "trip_members")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class TripMember {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "trip_id") private Trip trip;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "user_id") private User user;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 16) private MemberRole role;
    @Column(name = "joined_at", nullable = false) private Instant joinedAt;

    public TripMember(Trip trip, User user, MemberRole role, Instant joinedAt) {
        this.trip = trip;
        this.user = user;
        this.role = role;
        this.joinedAt = joinedAt;
    }

    public boolean isOrganizer() { return role == MemberRole.ORGANIZER; }
}
