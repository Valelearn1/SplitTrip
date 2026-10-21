package com.splittrip;

import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.testcontainers.containers.PostgreSQLContainer;

import javax.sql.DataSource;
import java.math.BigDecimal;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

/** La V10 dà ai rimborsi valuta, cambio e importo convertito (D-69): quelli vecchi restano uguali a prima. */
class MigrationV10Test {

    static final PostgreSQLContainer POSTGRES = new PostgreSQLContainer("postgres:16-alpine");

    @BeforeAll static void start() { POSTGRES.start(); }
    @AfterAll static void stop() { POSTGRES.stop(); }

    @Test
    void iRimborsiVecchiPrendonoLaValutaDelViaggioECambioUno() {
        DataSource ds = new DriverManagerDataSource(POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword());
        Flyway.configure().dataSource(ds).target("9").load().migrate();
        JdbcClient jdbc = JdbcClient.create(ds);
        UUID vale = UUID.randomUUID(), marco = UUID.randomUUID(), trip = UUID.randomUUID(), pv = UUID.randomUUID(), pm = UUID.randomUUID();
        jdbc.sql("insert into users (id, email, password_hash, display_name, created_at) values (?, 'v@e.it', 'x', 'Vale', now()), (?, 'm@e.it', 'x', 'Marco', now())").params(vale, marco).update();
        jdbc.sql("insert into trips (id, name, destination, start_date, end_date, currency, invite_code, status, owner_id, created_at, updated_at) values (?, 'Tokyo', 'Tokyo', '2026-11-01', '2026-11-05', 'JPY', 'TOKY-0001', 'ONGOING', ?, now(), now())").params(trip, vale).update();
        jdbc.sql("insert into participants (id, trip_id, user_id, display_name, role, joined_at) values (?, ?, ?, 'Vale', 'ORGANIZER', now()), (?, ?, ?, 'Marco', 'MEMBER', now())").params(pv, trip, vale, pm, trip, marco).update();
        jdbc.sql("insert into settlements (id, trip_id, from_participant_id, to_participant_id, amount, date, created_by, created_at) values (?, ?, ?, ?, 5000, '2026-11-03', ?, now())")
                .params(UUID.randomUUID(), trip, pm, pv, marco).update();

        Flyway.configure().dataSource(ds).load().migrate();

        assertThat(jdbc.sql("select currency from settlements").query(String.class).single()).isEqualTo("JPY");
        assertThat(jdbc.sql("select fx_rate from settlements").query(BigDecimal.class).single()).isEqualByComparingTo("1");
        assertThat(jdbc.sql("select amount_base from settlements").query(BigDecimal.class).single()).isEqualByComparingTo("5000");
    }
}
