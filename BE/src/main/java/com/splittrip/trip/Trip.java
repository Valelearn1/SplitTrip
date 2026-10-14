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

@Entity
@Table(name = "trips")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Trip {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Setter @Column(nullable = false, length = 80) private String name;
    @Setter @Column(nullable = false, length = 120) private String destination;
    @Setter @Column(name = "start_date", nullable = false) private LocalDate startDate;
    @Setter @Column(name = "end_date", nullable = false) private LocalDate endDate;
    @Column(nullable = false, length = 3) private String currency;
    @Setter @Column(name = "invite_code", nullable = false, length = 9) private String inviteCode;
    @Setter @Enumerated(EnumType.STRING) @Column(nullable = false, length = 16) private TripStatus status;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "owner_id")
    private User owner;

    /** Coordinate della destinazione per il meteo, calcolate al primo uso (D-37). */
    @Setter @Column(precision = 9, scale = 6) private BigDecimal latitude;
    @Setter @Column(precision = 9, scale = 6) private BigDecimal longitude;

    @Column(name = "created_at", nullable = false, updatable = false) private Instant createdAt;
    @Setter @Column(name = "updated_at", nullable = false) private Instant updatedAt;

    public Trip(String name, String destination, LocalDate startDate, LocalDate endDate,
                String currency, String inviteCode, User owner, Instant now) {
        this.name = name;
        this.destination = destination;
        this.startDate = startDate;
        this.endDate = endDate;
        this.currency = currency;
        this.inviteCode = inviteCode;
        this.status = TripStatus.PLANNING;
        this.owner = owner;
        this.createdAt = now;
        this.updatedAt = now;
    }

    public boolean isClosed() { return status == TripStatus.CLOSED; }
}
