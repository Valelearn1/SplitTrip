package com.splittrip.notification;

import com.splittrip.trip.Trip;
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
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "notifications")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "user_id") private User user;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "trip_id") private Trip trip;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 24) private NotificationType type;
    @Column(nullable = false, length = 200) private String message;
    @Column(nullable = false, length = 200) private String link;
    @Setter @Column(name = "read_at") private Instant readAt;
    @Column(name = "created_at", nullable = false) private Instant createdAt;

    public Notification(User user, Trip trip, NotificationType type, String message, String link, Instant now) {
        this.user = user;
        this.trip = trip;
        this.type = type;
        this.message = message;
        this.link = link;
        this.createdAt = now;
    }
}
