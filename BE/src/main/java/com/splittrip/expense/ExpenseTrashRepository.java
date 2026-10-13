package com.splittrip.expense;

import com.splittrip.expense.dto.TrashedExpenseResponse;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

/** Le spese cancellate sono invisibili a Hibernate (soft delete): qui si leggono e ripristinano con SQL diretto. */
@Repository
public class ExpenseTrashRepository {

    private final JdbcClient jdbc;

    public ExpenseTrashRepository(JdbcClient jdbc) { this.jdbc = jdbc; }

    public List<TrashedExpenseResponse> findTrashed(UUID tripId) {
        return jdbc.sql("""
                select id, description, amount, date, deleted_at from expenses
                where trip_id = :tripId and deleted_at is not null
                order by deleted_at desc
                """)
                .param("tripId", tripId)
                .query((rs, i) -> new TrashedExpenseResponse(
                        rs.getObject("id", UUID.class),
                        rs.getString("description"),
                        rs.getBigDecimal("amount"),
                        rs.getObject("date", LocalDate.class),
                        rs.getObject("deleted_at", OffsetDateTime.class).toInstant()))
                .list();
    }

    public boolean isTrashed(UUID tripId, UUID expenseId) {
        return jdbc.sql("select count(*) from expenses where id = :id and trip_id = :tripId and deleted_at is not null")
                .param("id", expenseId).param("tripId", tripId)
                .query(Long.class).single() > 0;
    }

    public List<UUID> shareUserIds(UUID expenseId) {
        return jdbc.sql("select user_id from expense_shares where expense_id = :id")
                .param("id", expenseId)
                .query(UUID.class).list();
    }

    public int restore(UUID tripId, UUID expenseId) {
        return jdbc.sql("update expenses set deleted_at = null where id = :id and trip_id = :tripId and deleted_at is not null")
                .param("id", expenseId).param("tripId", tripId)
                .update();
    }
}
