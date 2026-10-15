package com.splittrip.expense;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Collection;
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

    /** Quanto ha speso il gruppo nei miei viaggi, per valuta del viaggio (le spese nel cestino sono escluse da @SoftDelete). */
    @Query("select e.trip.currency, sum(e.amountBase) from Expense e where e.trip.id in :tripIds group by e.trip.currency")
    List<Object[]> groupTotalsByCurrency(Collection<UUID> tripIds);

    /** La mia parte. Si parte da Expense: @SoftDelete filtra la radice della query, non un join da ExpenseShare. */
    @Query("select e.trip.currency, sum(s.amount) from Expense e join e.shares s where s.participant.user.id = :userId group by e.trip.currency")
    List<Object[]> mySharesByCurrency(UUID userId);
}
