package com.splittrip.expense;

import com.splittrip.common.AmountRules;
import com.splittrip.trip.Participant;
import com.splittrip.trip.Trip;
import com.splittrip.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
import org.hibernate.annotations.SoftDelete;
import org.hibernate.annotations.SoftDeleteType;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "settlements")
@SoftDelete(strategy = SoftDeleteType.TIMESTAMP, columnName = "deleted_at")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Settlement {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "trip_id") private Trip trip;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "from_participant_id") private Participant fromParticipant;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "to_participant_id") private Participant toParticipant;
    @Column(nullable = false, precision = 12, scale = 2) private BigDecimal amount;
    // D-69: valuta di quello che è passato di mano, cambio salvato, importo nella valuta del viaggio (l'unico nei conti)
    @Column(nullable = false, length = 3) private String currency;
    @Column(name = "fx_rate", nullable = false, precision = 18, scale = 8) private BigDecimal fxRate;
    @Column(name = "amount_base", nullable = false, precision = 12, scale = 2) private BigDecimal amountBase;
    @Column(nullable = false) private LocalDate date;
    @Column(length = 200) private String note;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "created_by") private User createdBy;
    @Column(name = "created_at", nullable = false, updatable = false) private Instant createdAt;

    public Settlement(Trip trip, Participant fromParticipant, Participant toParticipant, BigDecimal amount, String currency,
                      BigDecimal fxRate, LocalDate date, String note, User createdBy, Instant now) {
        this.trip = trip;
        this.fromParticipant = fromParticipant;
        this.toParticipant = toParticipant;
        this.amount = amount;
        this.currency = currency;
        this.fxRate = fxRate;
        this.amountBase = AmountRules.convert(amount, fxRate, trip.getCurrency());
        this.date = date;
        this.note = note;
        this.createdBy = createdBy;
        this.createdAt = now;
    }
}
