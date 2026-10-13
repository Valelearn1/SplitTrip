package com.splittrip;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.simple.JdbcClient;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class SchemaTest extends IntegrationTest {

    @Autowired
    JdbcClient jdbc;

    @Test
    void flywayCreaLeTabelleDellaV1() {
        List<String> tables = jdbc.sql("""
                select table_name from information_schema.tables
                where table_schema = 'public' order by table_name
                """).query(String.class).list();
        assertThat(tables).contains("users", "trips", "trip_members", "expenses", "expense_shares", "settlements");
    }
}
