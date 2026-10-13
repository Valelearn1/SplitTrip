package com.splittrip.common;

import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;

import static org.assertj.core.api.Assertions.assertThat;

class DatabaseUrlEnvironmentPostProcessorTest {

    @Test
    void convertePostgresqlUrlInJdbc() {
        MockEnvironment env = new MockEnvironment()
                .withProperty("DATABASE_URL", "postgresql://alice:s3cret@db.render.com/splittrip");
        new DatabaseUrlEnvironmentPostProcessor().postProcessEnvironment(env, null);
        assertThat(env.getProperty("JDBC_DATABASE_URL")).isEqualTo("jdbc:postgresql://db.render.com:5432/splittrip");
        assertThat(env.getProperty("spring.datasource.username")).isEqualTo("alice");
        assertThat(env.getProperty("spring.datasource.password")).isEqualTo("s3cret");
    }

    @Test
    void lasciaInvariatoUnUrlJdbc() {
        MockEnvironment env = new MockEnvironment()
                .withProperty("DATABASE_URL", "jdbc:postgresql://localhost:5433/splittrip");
        new DatabaseUrlEnvironmentPostProcessor().postProcessEnvironment(env, null);
        assertThat(env.getProperty("JDBC_DATABASE_URL")).isEqualTo("jdbc:postgresql://localhost:5433/splittrip");
    }
}
