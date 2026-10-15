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

/** La V7 aggiunge reazioni, luogo delle foto e preferenze (spec v3.1 §3). */
class MigrationV7Test {

    static final PostgreSQLContainer POSTGRES = new PostgreSQLContainer("postgres:16-alpine");

    @BeforeAll static void start() { POSTGRES.start(); }
    @AfterAll static void stop() { POSTGRES.stop(); }

    @Test
    void reazioniLuogoEPreferenze() {
        DataSource ds = new DriverManagerDataSource(POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword());
        Flyway.configure().dataSource(ds).load().migrate();
        JdbcClient jdbc = JdbcClient.create(ds);

        UUID vale = UUID.randomUUID(), trip = UUID.randomUUID(), valeP = UUID.randomUUID(), msg = UUID.randomUUID();
        jdbc.sql("insert into users (id, email, password_hash, display_name, created_at) values (?, 'vale@e.it', 'x', 'Vale', now())").param(vale).update();
        // preferenze con i default
        assertThat(jdbc.sql("select preferred_currency from users where id = ?").param(vale).query(String.class).single()).isEqualTo("EUR");
        assertThat(jdbc.sql("select chat_sound from users where id = ?").param(vale).query(Boolean.class).single()).isTrue();
        assertThat(jdbc.sql("select reduce_motion from users where id = ?").param(vale).query(Boolean.class).single()).isFalse();
        jdbc.sql("""
                insert into trips (id, name, destination, start_date, end_date, currency, invite_code, status, owner_id, created_at, updated_at)
                values (?, 'Roma', 'Roma', '2026-11-01', '2026-11-05', 'EUR', 'ROMA-7K2P', 'ONGOING', ?, now(), now())
                """).params(trip, vale).update();
        jdbc.sql("insert into participants (id, trip_id, user_id, display_name, role, joined_at) values (?, ?, ?, 'Vale', 'ORGANIZER', now())").params(valeP, trip, vale).update();
        jdbc.sql("insert into chat_messages (id, trip_id, author_participant_id, kind, content, created_at) values (?, ?, ?, 'TEXT', 'Ciao', now())").params(msg, trip, valeP).update();

        String react = "insert into message_reactions (message_id, participant_id, emoji, created_at) values (?, ?, ?, now())";
        jdbc.sql(react).params(msg, valeP, "👍").update();
        jdbc.sql(react).params(msg, valeP, "❤️").update();                      // emoji diverse: ok
        assertThatThrownBy(() -> jdbc.sql(react).params(msg, valeP, "👍").update()).hasMessageContaining("message_reactions_pkey"); // stessa emoji due volte: no
        assertThatThrownBy(() -> jdbc.sql(react).params(msg, valeP, "🚀").update()).hasMessageContaining("message_reactions_emoji"); // fuori dalla lista: no

        // luogo a mano solo con le coordinate
        String photo = "insert into photos (id, trip_id, uploader_id, kind, image, thumbnail, width, height, place_name, latitude, longitude, created_at) values (?, ?, ?, 'PHOTO', '\\x00', '\\x00', 1, 1, ?, ?, ?, now())";
        jdbc.sql(photo).params(UUID.randomUUID(), trip, vale, "Belvedere di Santa Luzia", 38.7128, -9.1297).update();
        assertThatThrownBy(() -> jdbc.sql(photo).params(UUID.randomUUID(), trip, vale, "Senza coordinate", null, null).update()).hasMessageContaining("photos_place");

        // cascade: via il messaggio, via le reazioni; via il viaggio, via tutto
        jdbc.sql("delete from chat_messages where id = ?").param(msg).update();
        assertThat(jdbc.sql("select count(*) from message_reactions").query(Long.class).single()).isZero();
        jdbc.sql("delete from trips where id = ?").param(trip).update();
        assertThat(jdbc.sql("select count(*) from photos").query(Long.class).single()).isZero();
    }
}
