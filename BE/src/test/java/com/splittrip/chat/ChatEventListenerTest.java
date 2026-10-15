package com.splittrip.chat;

import com.splittrip.IntegrationTest;
import com.splittrip.TestExpenses;
import com.splittrip.TestTrips;
import com.splittrip.TestUsers;
import com.splittrip.common.events.ExpenseCreated;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.transaction.support.TransactionTemplate;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

class ChatEventListenerTest extends IntegrationTest {

    @Autowired ApplicationEventPublisher events;
    @Autowired TransactionTemplate tx;
    @Autowired JdbcClient jdbc;

    @Test
    void spesaEIngressoDiventanoRigheEventoConFotografiaDelTesto() throws Exception {
        String vale = TestUsers.register(mvc, "Vale");
        String marco = TestUsers.register(mvc, "Marco");
        UUID tripId = TestTrips.create(mvc, vale, "Roma");
        TestTrips.join(mvc, marco, TestTrips.inviteCode(mvc, vale, tripId));
        UUID valeP = TestTrips.participantOf(mvc, vale, tripId);
        UUID marcoP = TestTrips.participantOf(mvc, marco, tripId);
        UUID expenseId = TestExpenses.createEqual(mvc, marco, tripId, "Cena", "45.00", marcoP, valeP, marcoP);

        mvc.perform(get("/api/trips/" + tripId + "/messages").header("Authorization", "Bearer " + vale))
                .andExpect(jsonPath("$.items[0].kind").value("EVENT"))
                .andExpect(jsonPath("$.items[0].eventType").value("EXPENSE_CREATED"))
                .andExpect(jsonPath("$.items[0].content").value("Marco ha aggiunto «Cena» · 45,00 €"))
                .andExpect(jsonPath("$.items[0].refId").value(expenseId.toString()))
                .andExpect(jsonPath("$.items[0].authorName").doesNotExist())
                .andExpect(jsonPath("$.items[1].content").value("Marco ora fa parte del viaggio"));
    }

    @Test
    void transazioneAnnullataNessunaRiga() throws Exception {
        String vale = TestUsers.register(mvc, "Vale");
        UUID valeId = TestUsers.idOf(mvc, vale);
        UUID tripId = TestTrips.create(mvc, vale, "Roma");
        tx.executeWithoutResult(status -> {
            events.publishEvent(new ExpenseCreated(tripId, UUID.randomUUID(), valeId, "Vale", "Fantasma", Map.of(), new BigDecimal("1.00"), "EUR"));
            status.setRollbackOnly();
        });
        assertThat(jdbc.sql("select count(*) from chat_messages where trip_id = ?").param(tripId).query(Long.class).single()).isZero();
    }
}
