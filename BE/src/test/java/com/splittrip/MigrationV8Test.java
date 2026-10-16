package com.splittrip;

import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.testcontainers.postgresql.PostgreSQLContainer;

import javax.sql.DataSource;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/** La V8 aggiunge le ipotesi di «Indovina il totale» e il tema (spec v3.2 §3). */
class MigrationV8Test {

    static final PostgreSQLContainer POSTGRES = new PostgreSQLContainer("postgres:16-alpine");

    @BeforeAll static void start() { POSTGRES.start(); }
    @AfterAll static void stop() { POSTGRES.stop(); }

    @Test
    void ipotesiUnicaETemaInLista() {
        DataSource ds = new DriverManagerDataSource(POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword());
        Flyway.configure().dataSource(ds).load().migrate();
        JdbcClient jdbc = JdbcClient.create(ds);

        UUID vale = UUID.randomUUID(), trip = UUID.randomUUID(), valeP = UUID.randomUUID();
        jdbc.sql("insert into users (id, email, password_hash, display_name, created_at) values (?, 'vale@e.it', 'x', 'Vale', now())").param(vale).update();
        assertThat(jdbc.sql("select theme from users where id = ?").param(vale).query(String.class).single()).isEqualTo("SYSTEM");
        assertThatThrownBy(() -> jdbc.sql("update users set theme = 'NEON' where id = ?").param(vale).update()).hasMessageContaining("users_theme");
        jdbc.sql("""
                insert into trips (id, name, destination, start_date, end_date, currency, invite_code, status, owner_id, created_at, updated_at)
                values (?, 'Roma', 'Roma', '2026-11-01', '2026-11-05', 'EUR', 'ROMA-7K2P', 'CLOSED', ?, now(), now())
                """).params(trip, vale).update();
        jdbc.sql("insert into participants (id, trip_id, user_id, display_name, role, joined_at) values (?, ?, ?, 'Vale', 'ORGANIZER', now())").params(valeP, trip, vale).update();

        String guess = "insert into wrapped_guesses (trip_id, participant_id, amount, created_at) values (?, ?, ?, now())";
        jdbc.sql(guess).params(trip, valeP, 400).update();
        assertThatThrownBy(() -> jdbc.sql(guess).params(trip, valeP, 500).update()).hasMessageContaining("wrapped_guesses_pkey"); // una a testa
        assertThatThrownBy(() -> jdbc.sql("insert into wrapped_guesses (trip_id, participant_id, amount, created_at) values (?, ?, -1, now())")
                .params(UUID.randomUUID(), valeP).update()).hasMessageContaining("wrapped_guesses_amount");           // mai negativa
        jdbc.sql("delete from trips where id = ?").param(trip).update();
        assertThat(jdbc.sql("select count(*) from wrapped_guesses").query(Long.class).single()).isZero();   // via con il viaggio
    }
}
