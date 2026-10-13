package com.splittrip.expense;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.UUID;

public interface ExpenseShareRepository extends JpaRepository<ExpenseShare, UUID> {

    @Modifying
    @Query("delete from ExpenseShare s where s.expense.id = :expenseId")
    void deleteAllByExpenseId(UUID expenseId);

    /** Solo quote di spese attive: Hibernate aggiunge da solo il filtro sul soft delete della spesa. */
    @Query("select count(s) > 0 from ExpenseShare s where s.user.id = :userId and s.expense.trip.id = :tripId")
    boolean existsByUserIdAndExpenseTripId(UUID userId, UUID tripId);
}
