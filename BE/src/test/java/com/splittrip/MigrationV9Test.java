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

/** La V9 aggiunge i token di ripristino della password: solo l'hash, unico, e se ne vanno con l'utente (D-61). */
class MigrationV9Test {

    static final PostgreSQLContainer POSTGRES = new PostgreSQLContainer("postgres:16-alpine");

    @BeforeAll static void start() { POSTGRES.start(); }
    @AfterAll static void stop() { POSTGRES.stop(); }

    @Test
    void tokenConHashUnicoCheSeNeVannoConLUtente() {
        DataSource ds = new DriverManagerDataSource(POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword());
        Flyway.configure().dataSource(ds).load().migrate();
        JdbcClient jdbc = JdbcClient.create(ds);

        UUID vale = UUID.randomUUID();
        jdbc.sql("insert into users (id, email, password_hash, display_name, created_at) values (?, 'vale@e.it', 'x', 'Vale', now())").param(vale).update();
        String insert = "insert into password_reset_tokens (id, user_id, token_hash, expires_at, created_at) values (?, ?, ?, now() + interval '30 minutes', now())";
        String hash = "a".repeat(64);
        jdbc.sql(insert).params(UUID.randomUUID(), vale, hash).update();
        assertThatThrownBy(() -> jdbc.sql(insert).params(UUID.randomUUID(), vale, hash).update()).hasMessageContaining("token_hash");
        assertThat(jdbc.sql("select used_at is null from password_reset_tokens").query(Boolean.class).single()).isTrue();   // nuovo: non usato
        jdbc.sql("delete from users where id = ?").param(vale).update();
        assertThat(jdbc.sql("select count(*) from password_reset_tokens").query(Long.class).single()).isZero();
    }
}
