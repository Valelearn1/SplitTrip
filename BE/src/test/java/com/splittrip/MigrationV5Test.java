package com.splittrip;

import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.testcontainers.postgresql.PostgreSQLContainer;

import javax.sql.DataSource;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/** La V5 aggiunge chat, «letto fino a» e consigli AI (spec v3 §3). */
class MigrationV5Test {

    static final PostgreSQLContainer POSTGRES = new PostgreSQLContainer("postgres:16-alpine");

    @BeforeAll static void start() { POSTGRES.start(); }
    @AfterAll static void stop() { POSTGRES.stop(); }

    @Test
    void creaLeTabelleLiveECancellaInCascataConIlViaggio() {
        DataSource ds = new DriverManagerDataSource(POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword());
        Flyway.configure().dataSource(ds).load().migrate();
        JdbcClient jdbc = JdbcClient.create(ds);

        assertThat(jdbc.sql("select table_name from information_schema.tables where table_schema = 'public'").query(String.class).list())
                .contains("chat_messages", "ai_suggestions");
        assertThat(jdbc.sql("select count(*) from information_schema.columns where table_name = 'participants' and column_name = 'chat_read_at'")
                .query(Long.class).single()).isEqualTo(1L);

        UUID vale = UUID.randomUUID(), trip = UUID.randomUUID(), valeP = UUID.randomUUID();
        jdbc.sql("insert into users (id, email, password_hash, display_name, created_at) values (?, 'vale@e.it', 'x', 'Vale', now())").param(vale).update();
        jdbc.sql("""
                insert into trips (id, name, destination, start_date, end_date, currency, invite_code, status, owner_id, created_at, updated_at)
                values (?, 'Roma', 'Roma', '2026-11-01', '2026-11-05', 'EUR', 'ROMA-7K2P', 'ONGOING', ?, now(), now())
                """).params(trip, vale).update();
        jdbc.sql("insert into participants (id, trip_id, user_id, display_name, role, joined_at) values (?, ?, ?, 'Vale', 'ORGANIZER', now())").params(valeP, trip, vale).update();

        String text = "insert into chat_messages (id, trip_id, author_participant_id, kind, content, created_at) values (?, ?, ?, 'TEXT', ?, now())";
        jdbc.sql(text).params(UUID.randomUUID(), trip, valeP, "Ciao").update();
        jdbc.sql("insert into chat_messages (id, trip_id, kind, content, event_type, ref_id, created_at) values (?, ?, 'EVENT', 'Vale ha aggiunto «Cena» · 10,00 €', 'EXPENSE_CREATED', ?, now())")
                .params(UUID.randomUUID(), trip, UUID.randomUUID()).update();
        // eliminato: testo null e deleted_at valorizzato
        jdbc.sql("insert into chat_messages (id, trip_id, author_participant_id, kind, content, created_at, deleted_at) values (?, ?, ?, 'TEXT', null, now(), now())")
                .params(UUID.randomUUID(), trip, valeP).update();
        // un TEXT senza autore, un EVENT con autore, un testo vuoto o lungo, un eliminato con testo: vietati
        assertThatThrownBy(() -> jdbc.sql(text).params(UUID.randomUUID(), trip, null, "x").update()).hasMessageContaining("chat_kind");
        assertThatThrownBy(() -> jdbc.sql("insert into chat_messages (id, trip_id, author_participant_id, kind, content, event_type, created_at) values (?, ?, ?, 'EVENT', 'x', 'EXPENSE_CREATED', now())")
                .params(UUID.randomUUID(), trip, valeP).update()).hasMessageContaining("chat_kind");
        assertThatThrownBy(() -> jdbc.sql(text).params(UUID.randomUUID(), trip, valeP, "").update()).hasMessageContaining("chat_content");
        assertThatThrownBy(() -> jdbc.sql(text).params(UUID.randomUUID(), trip, valeP, "x".repeat(1001)).update()).isInstanceOf(Exception.class);
        assertThatThrownBy(() -> jdbc.sql("insert into chat_messages (id, trip_id, author_participant_id, kind, content, created_at, deleted_at) values (?, ?, ?, 'TEXT', 'x', now(), now())")
                .params(UUID.randomUUID(), trip, valeP).update()).hasMessageContaining("chat_content");
        jdbc.sql("insert into ai_suggestions (id, trip_id, kind, content, created_at) values (?, ?, 'TIPS', '{}', now())").params(UUID.randomUUID(), trip).update();

        // la lezione della V3: il cascade del viaggio arriva su participants prima che su chat_messages
        jdbc.sql("delete from trips where id = ?").param(trip).update();
        for (String t : List.of("chat_messages", "ai_suggestions", "participants")) {
            assertThat(jdbc.sql("select count(*) from " + t).query(Long.class).single()).as(t).isEqualTo(0L);
        }
    }
}
