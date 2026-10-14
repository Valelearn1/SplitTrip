package com.splittrip.expense;

import com.splittrip.trip.Participant;
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

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "expense_shares")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ExpenseShare {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // EAGER obbligatorio: Hibernate non permette to-one LAZY verso un'entità con @SoftDelete
    @ManyToOne(fetch = FetchType.EAGER, optional = false) @JoinColumn(name = "expense_id") private Expense expense;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "participant_id") private Participant participant;
    @Column(nullable = false, precision = 12, scale = 2) private BigDecimal amount;
    /** Input da cui è stata calcolata la quota (peso o notti/giorni), per riaprire il form; null per EQUAL e CUSTOM. */
    @Column(precision = 8, scale = 2) private BigDecimal weight;

    public ExpenseShare(Expense expense, Participant participant, BigDecimal amount, BigDecimal weight) {
        this.expense = expense;
        this.participant = participant;
        this.amount = amount;
        this.weight = weight;
    }
}
