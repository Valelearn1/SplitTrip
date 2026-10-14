package com.splittrip;

import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.testcontainers.postgresql.PostgreSQLContainer;

import javax.sql.DataSource;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

/** La V2 deve migrare i dati di produzione della v1 senza perdere nulla (spec v1.5 §3). */
class MigrationV2Test {

    static final PostgreSQLContainer POSTGRES = new PostgreSQLContainer("postgres:16-alpine");

    @BeforeAll static void start() { POSTGRES.start(); }
    @AfterAll static void stop() { POSTGRES.stop(); }

    @Test
    void migraIDatiDellaV1AiPartecipanti() {
        DataSource ds = new DriverManagerDataSource(POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword());
        Flyway.configure().dataSource(ds).target("1").load().migrate();
        JdbcClient jdbc = JdbcClient.create(ds);

        UUID vale = UUID.randomUUID(), marco = UUID.randomUUID(), trip = UUID.randomUUID();
        UUID expense = UUID.randomUUID(), trashed = UUID.randomUUID(), settlement = UUID.randomUUID();
        for (var u : List.of(Map.entry(vale, "Vale"), Map.entry(marco, "Marco"))) {
            jdbc.sql("insert into users (id, email, password_hash, display_name, created_at) values (?, ?, 'x', ?, now())")
                    .params(u.getKey(), u.getValue().toLowerCase() + "@e.it", u.getValue()).update();
        }
        jdbc.sql("""
                insert into trips (id, name, destination, start_date, end_date, currency, invite_code, status, owner_id, created_at, updated_at)
                values (?, 'Roma', 'Roma', '2026-11-01', '2026-11-05', 'EUR', 'ROMA-7K2P', 'ONGOING', ?, now(), now())
                """).params(trip, vale).update();
        // Marco NON è più membro (ha lasciato in v1), ma compare ancora nei soldi: è l'orfano da sanare
        jdbc.sql("insert into trip_members (id, trip_id, user_id, role, joined_at) values (?, ?, ?, 'ORGANIZER', now())")
                .params(UUID.randomUUID(), trip, vale).update();
        jdbc.sql("""
                insert into expenses (id, trip_id, payer_id, description, amount, date, category, split_type, created_by, created_at, updated_at, deleted_at)
                values (?, ?, ?, 'Cena', 90.00, '2026-11-02', 'FOOD', 'EQUAL', ?, now(), now(), null),
                       (?, ?, ?, 'Taxi', 20.00, '2026-11-02', 'TRANSPORT', 'EQUAL', ?, now(), now(), now())
                """).params(expense, trip, vale, vale, trashed, trip, marco, marco).update();
        jdbc.sql("insert into expense_shares (id, expense_id, user_id, amount) values (?, ?, ?, 45.00), (?, ?, ?, 45.00), (?, ?, ?, 20.00)")
                .params(UUID.randomUUID(), expense, vale, UUID.randomUUID(), expense, marco, UUID.randomUUID(), trashed, vale).update();
        jdbc.sql("insert into settlements (id, trip_id, from_user_id, to_user_id, amount, date, created_by, created_at) values (?, ?, ?, ?, 10.00, '2026-11-03', ?, now())")
                .params(settlement, trip, marco, vale, marco).update();

        Flyway.configure().dataSource(ds).load().migrate();

        UUID valeP = jdbc.sql("select id from participants where trip_id = ? and user_id = ?").params(trip, vale).query(UUID.class).single();
        UUID marcoP = jdbc.sql("select id from participants where trip_id = ? and user_id = ?").params(trip, marco).query(UUID.class).single();
        assertThat(jdbc.sql("select display_name from participants where id = ?").param(valeP).query(String.class).single()).isEqualTo("Vale");
        assertThat(jdbc.sql("select left_at is not null from participants where id = ?").param(marcoP).query(Boolean.class).single()).isTrue();
        assertThat(jdbc.sql("select role from participants where id = ?").param(marcoP).query(String.class).single()).isEqualTo("MEMBER");
        assertThat(jdbc.sql("select default_weight from participants where id = ?").param(valeP).query(BigDecimal.class).single()).isEqualByComparingTo("1");

        assertThat(jdbc.sql("select payer_participant_id from expenses where id = ?").param(expense).query(UUID.class).single()).isEqualTo(valeP);
        assertThat(jdbc.sql("select payer_participant_id from expenses where id = ?").param(trashed).query(UUID.class).single()).isEqualTo(marcoP);
        assertThat(jdbc.sql("select currency from expenses where id = ?").param(expense).query(String.class).single()).isEqualTo("EUR");
        assertThat(jdbc.sql("select amount_base from expenses where id = ?").param(expense).query(BigDecimal.class).single()).isEqualByComparingTo("90.00");
        assertThat(jdbc.sql("select fx_rate from expenses where id = ?").param(expense).query(BigDecimal.class).single()).isEqualByComparingTo("1");
        assertThat(jdbc.sql("select count(*) from expense_shares where expense_id = ? and participant_id = ?").params(expense, marcoP).query(Long.class).single()).isEqualTo(1L);
        assertThat(jdbc.sql("select from_participant_id from settlements where id = ?").param(settlement).query(UUID.class).single()).isEqualTo(marcoP);
        assertThat(jdbc.sql("select to_participant_id from settlements where id = ?").param(settlement).query(UUID.class).single()).isEqualTo(valeP);

        List<String> columns = jdbc.sql("select column_name from information_schema.columns where table_name in ('expenses','expense_shares','settlements')").query(String.class).list();
        assertThat(columns).doesNotContain("payer_id", "user_id", "from_user_id", "to_user_id").contains("weight", "day_basis");
    }
}
