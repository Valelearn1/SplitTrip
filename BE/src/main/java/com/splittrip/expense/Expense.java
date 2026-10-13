package com.splittrip.expense;

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
    @Setter @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "payer_id") private User payer;
    @Setter @Column(nullable = false, length = 120) private String description;
    @Setter @Column(nullable = false, precision = 12, scale = 2) private BigDecimal amount;
    @Setter @Column(nullable = false) private LocalDate date;
    @Setter @Enumerated(EnumType.STRING) @Column(nullable = false, length = 16) private ExpenseCategory category;
    @Setter @Enumerated(EnumType.STRING) @Column(name = "split_type", nullable = false, length = 16) private SplitType splitType;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "created_by") private User createdBy;
    @Column(name = "created_at", nullable = false, updatable = false) private Instant createdAt;
    @Setter @Column(name = "updated_at", nullable = false) private Instant updatedAt;

    // Niente cascade REMOVE né orphanRemoval: la cancellazione del padre è soft e le quote devono restare.
    @OneToMany(mappedBy = "expense", cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    private List<ExpenseShare> shares = new ArrayList<>();

    public Expense(Trip trip, User payer, String description, BigDecimal amount, LocalDate date,
                   ExpenseCategory category, SplitType splitType, User createdBy, Instant now) {
        this.trip = trip;
        this.payer = payer;
        this.description = description;
        this.amount = amount;
        this.date = date;
        this.category = category;
        this.splitType = splitType;
        this.createdBy = createdBy;
        this.createdAt = now;
        this.updatedAt = now;
    }
}
