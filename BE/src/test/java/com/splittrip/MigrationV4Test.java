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

/** La V4 aggiunge liste, foto, avatar, notifiche e le coordinate del viaggio (spec v2 §3). */
class MigrationV4Test {

    static final PostgreSQLContainer POSTGRES = new PostgreSQLContainer("postgres:16-alpine");

    @BeforeAll static void start() { POSTGRES.start(); }
    @AfterAll static void stop() { POSTGRES.stop(); }

    @Test
    void creaLeTabelleSocialECancellaInCascataConIlViaggio() {
        DataSource ds = new DriverManagerDataSource(POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword());
        Flyway.configure().dataSource(ds).load().migrate();
        JdbcClient jdbc = JdbcClient.create(ds);

        List<String> tables = jdbc.sql("select table_name from information_schema.tables where table_schema = 'public'").query(String.class).list();
        assertThat(tables).contains("todo_lists", "todo_items", "photos", "user_avatars", "notifications");
        assertThat(jdbc.sql("select count(*) from information_schema.columns where table_name = 'trips' and column_name in ('latitude','longitude')").query(Long.class).single()).isEqualTo(2L);

        UUID vale = UUID.randomUUID(), trip = UUID.randomUUID(), valeP = UUID.randomUUID(), list = UUID.randomUUID(), expense = UUID.randomUUID();
        jdbc.sql("insert into users (id, email, password_hash, display_name, created_at) values (?, 'vale@e.it', 'x', 'Vale', now())").param(vale).update();
        jdbc.sql("""
                insert into trips (id, name, destination, start_date, end_date, currency, invite_code, status, owner_id, created_at, updated_at)
                values (?, 'Roma', 'Roma', '2026-11-01', '2026-11-05', 'EUR', 'ROMA-7K2P', 'ONGOING', ?, now(), now())
                """).params(trip, vale).update();
        jdbc.sql("insert into participants (id, trip_id, user_id, display_name, role, joined_at) values (?, ?, ?, 'Vale', 'ORGANIZER', now())").params(valeP, trip, vale).update();
        jdbc.sql("insert into todo_lists (id, trip_id, title, type, created_by, created_at) values (?, ?, 'Valigia', 'PACKING', ?, now())").params(list, trip, vale).update();
        jdbc.sql("insert into todo_items (id, list_id, text, done, assignee_participant_id, created_by, created_at, updated_at) values (?, ?, 'Phon', false, ?, ?, now(), now())")
                .params(UUID.randomUUID(), list, valeP, vale).update();
        jdbc.sql("""
                insert into expenses (id, trip_id, payer_participant_id, description, amount, currency, fx_rate, amount_base, date, category, split_type, created_by, created_at, updated_at)
                values (?, ?, ?, 'Cena', 10.00, 'EUR', 1, 10.00, '2026-11-02', 'FOOD', 'EQUAL', ?, now(), now())
                """).params(expense, trip, valeP, vale).update();
        String photo = "insert into photos (id, trip_id, uploader_id, kind, expense_id, image, thumbnail, width, height, created_at) values (?, ?, ?, ?, ?, '\\x00', '\\x00', 1, 1, now())";
        jdbc.sql(photo).params(UUID.randomUUID(), trip, vale, "PHOTO", null).update();
        jdbc.sql(photo).params(UUID.randomUUID(), trip, vale, "RECEIPT", expense).update();
        // un solo scontrino per spesa
        assertThatThrownBy(() -> jdbc.sql(photo).params(UUID.randomUUID(), trip, vale, "RECEIPT", expense).update())
                .hasMessageContaining("photos_receipt_unique");
        // RECEIPT senza spesa e PHOTO con spesa sono vietati
        assertThatThrownBy(() -> jdbc.sql(photo).params(UUID.randomUUID(), trip, vale, "RECEIPT", null).update())
                .hasMessageContaining("photos_kind_expense");
        // latitudine senza longitudine è vietata
        assertThatThrownBy(() -> jdbc.sql("insert into photos (id, trip_id, uploader_id, kind, image, thumbnail, width, height, latitude, created_at) values (?, ?, ?, 'PHOTO', '\\x00', '\\x00', 1, 1, 41.9, now())")
                .params(UUID.randomUUID(), trip, vale).update()).hasMessageContaining("photos_location");
        jdbc.sql("insert into notifications (id, user_id, trip_id, type, message, link, created_at) values (?, ?, ?, 'EXPENSE_ADDED', 'm', '/x', now())")
                .params(UUID.randomUUID(), vale, trip).update();
        jdbc.sql("insert into user_avatars (user_id, image, updated_at) values (?, '\\x00', now())").param(vale).update();

        jdbc.sql("delete from trips where id = ?").param(trip).update();
        for (String t : List.of("todo_lists", "todo_items", "photos", "notifications")) {
            assertThat(jdbc.sql("select count(*) from " + t).query(Long.class).single()).as(t).isEqualTo(0L);
        }
        assertThat(jdbc.sql("select count(*) from user_avatars").query(Long.class).single()).isEqualTo(1L);
    }
}
