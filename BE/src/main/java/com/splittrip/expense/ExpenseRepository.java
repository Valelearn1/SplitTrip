package com.splittrip.expense;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ExpenseRepository extends JpaRepository<Expense, UUID> {

    @Query("""
            select distinct e from Expense e
            left join fetch e.shares s
            left join fetch s.participant
            join fetch e.payer
            join fetch e.createdBy
            where e.trip.id = :tripId
            order by e.date desc, e.createdAt desc
            """)
    List<Expense> findAllByTripIdWithShares(UUID tripId);

    @Query("""
            select e from Expense e
            left join fetch e.shares s
            left join fetch s.participant
            join fetch e.payer
            join fetch e.createdBy
            where e.id = :expenseId and e.trip.id = :tripId
            """)
    Optional<Expense> findByIdAndTripIdWithShares(UUID expenseId, UUID tripId);

    /** Senza fetch delle quote: serve al soft delete, che non deve avere quote gestite in sessione. */
    Optional<Expense> findByIdAndTripId(UUID id, UUID tripId);

    boolean existsByTripId(UUID tripId);
    boolean existsByTripIdAndPayerId(UUID tripId, UUID payerId);
}
