package com.splittrip.expense;

import com.splittrip.common.AmountRules;
import com.splittrip.trip.Participant;
import com.splittrip.trip.Trip;
import com.splittrip.user.User;
import jakarta.persistence.CascadeType;
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
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.SoftDelete;
import org.hibernate.annotations.SoftDeleteType;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "expenses")
@SoftDelete(strategy = SoftDeleteType.TIMESTAMP, columnName = "deleted_at")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "trip_id") private Trip trip;
    @Setter @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "payer_participant_id") private Participant payer;
    @Setter @Column(nullable = false, length = 120) private String description;
    @Column(nullable = false, precision = 12, scale = 2) private BigDecimal amount;
    // D-69: valuta dello scontrino, cambio salvato, importo nella valuta del viaggio (l'unico che entra nei conti)
    @Column(nullable = false, length = 3) private String currency;
    @Column(name = "fx_rate", nullable = false, precision = 18, scale = 8) private BigDecimal fxRate;
    @Column(name = "amount_base", nullable = false, precision = 12, scale = 2) private BigDecimal amountBase;
    @Setter @Column(nullable = false) private LocalDate date;
    @Setter @Enumerated(EnumType.STRING) @Column(nullable = false, length = 16) private ExpenseCategory category;
    @Setter @Enumerated(EnumType.STRING) @Column(name = "split_type", nullable = false, length = 16) private SplitType splitType;
    @Setter @Enumerated(EnumType.STRING) @Column(name = "day_basis", length = 8) private DayBasis dayBasis;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "created_by") private User createdBy;
    @Column(name = "created_at", nullable = false, updatable = false) private Instant createdAt;
    @Setter @Column(name = "updated_at", nullable = false) private Instant updatedAt;

    // Niente cascade REMOVE né orphanRemoval: la cancellazione del padre è soft e le quote devono restare.
    @OneToMany(mappedBy = "expense", cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    private List<ExpenseShare> shares = new ArrayList<>();

    public Expense(Trip trip, Participant payer, String description, BigDecimal amount, String currency, BigDecimal fxRate, LocalDate date,
                   ExpenseCategory category, SplitType splitType, DayBasis dayBasis, User createdBy, Instant now) {
        this.trip = trip;
        this.payer = payer;
        this.description = description;
        setMoney(amount, currency, fxRate);
        this.date = date;
        this.category = category;
        this.splitType = splitType;
        this.dayBasis = dayBasis;
        this.createdBy = createdBy;
        this.createdAt = now;
        this.updatedAt = now;
    }

    /** D-69: scontrino, cambio e importo convertito (l'unico che entra nei conti). */
    public void setMoney(BigDecimal amount, String currency, BigDecimal fxRate) {
        this.amount = amount;
        this.currency = currency;
        this.fxRate = fxRate;
        this.amountBase = AmountRules.convert(amount, fxRate);
    }
}
