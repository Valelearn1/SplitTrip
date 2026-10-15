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
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

/** Chi partecipa al viaggio: identità economica (soldi) e di accesso (user, se ha un account). Non si cancella mai: chi esce ha leftAt (D-30). */
@Entity
@Table(name = "participants")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Participant {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "trip_id") private Trip trip;
    @Setter @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "user_id") private User user; // null = senza account
    @Setter @Column(name = "display_name", nullable = false, length = 40) private String displayName;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 16) private MemberRole role;
    @Setter @Column(name = "default_weight", nullable = false, precision = 6, scale = 2) private BigDecimal defaultWeight = BigDecimal.ONE;
    @Setter @Column(name = "arrival_date") private LocalDate arrivalDate;
    @Setter @Column(name = "departure_date") private LocalDate departureDate;
    @Column(name = "joined_at", nullable = false) private Instant joinedAt;
    @Setter @Column(name = "left_at") private Instant leftAt;
    @Setter @Column(name = "chat_read_at") private Instant chatReadAt;

    public Participant(Trip trip, User user, String displayName, MemberRole role, Instant joinedAt) {
        this.trip = trip;
        this.user = user;
        this.displayName = displayName;
        this.role = role;
        this.joinedAt = joinedAt;
    }

    public boolean isOrganizer() { return role == MemberRole.ORGANIZER; }
    public boolean hasAccount() { return user != null; }
    public boolean hasLeft() { return leftAt != null; }
    /** Id dell'utente senza caricare l'entità (null se senza account). */
    public UUID userId() { return user == null ? null : user.getId(); }
}
