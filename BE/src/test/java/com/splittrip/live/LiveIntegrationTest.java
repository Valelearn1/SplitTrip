package com.splittrip.live;

import com.splittrip.TestTrips;
import com.splittrip.TestUsers;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.postgresql.PostgreSQLContainer;

import java.util.UUID;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.awaitility.Awaitility.await;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
class LiveIntegrationTest {

    @ServiceConnection
    static final PostgreSQLContainer POSTGRES = new PostgreSQLContainer("postgres:16-alpine");
    static { POSTGRES.start(); }

    @LocalServerPort int port;
    @Autowired MockMvc mvc;
    @Autowired LivePublisher live;

    @Test
    void connectSenzaTokenOConTokenFalsoVieneRifiutato() {
        assertThatThrownBy(() -> LiveTestClient.connect(port, null)).isInstanceOf(Exception.class);
        assertThatThrownBy(() -> LiveTestClient.connect(port, "non-un-jwt")).isInstanceOf(Exception.class);
    }

    @Test
    void ognunoRiceveSoloLeProprieNotifiche() throws Exception {
        String vale = TestUsers.register(mvc, "Vale");
        String marco = TestUsers.register(mvc, "Marco");
        UUID valeId = TestUsers.idOf(mvc, vale);
        LiveTestClient v = LiveTestClient.connect(port, vale);
        LiveTestClient m = LiveTestClient.connect(port, marco);
        BlockingQueue<String> vq = v.subscribe("/user/queue/notifications");
        BlockingQueue<String> mq = m.subscribe("/user/queue/notifications");
        Thread.sleep(300); // la sottoscrizione arriva al broker

        live.toUser(valeId, java.util.Map.of("hello", "Vale"));

        assertThat(vq.poll(5, TimeUnit.SECONDS)).contains("\"hello\":\"Vale\"");
        assertThat(mq.poll(500, TimeUnit.MILLISECONDS)).isNull();
        v.disconnect(); m.disconnect();
    }

    @Test
    void ilCanaleDelViaggioArrivaSoloAiMembri() throws Exception {
        String vale = TestUsers.register(mvc, "Vale");
        String estraneo = TestUsers.register(mvc, "Estraneo");
        UUID tripId = TestTrips.create(mvc, vale, "Roma");
        LiveTestClient v = LiveTestClient.connect(port, vale);
        BlockingQueue<String> q = v.subscribe("/topic/trips/" + tripId);
        Thread.sleep(300);
        live.toTrip(tripId, "typing", java.util.Map.of("name", "Vale"));
        assertThat(q.poll(5, TimeUnit.SECONDS)).contains("\"type\":\"typing\"").contains("\"name\":\"Vale\"");

        // Review Focus 1: in Spring un SUBSCRIBE rifiutato chiude tutta la connessione
        LiveTestClient e = LiveTestClient.connect(port, estraneo);
        e.subscribe("/topic/trips/" + tripId);
        await().atMost(5, TimeUnit.SECONDS).until(() -> !e.isConnected());
        v.disconnect();
    }

    @Test
    void destinazioniSconosciuteSonoRifiutate() throws Exception {
        String vale = TestUsers.register(mvc, "Vale");
        LiveTestClient v = LiveTestClient.connect(port, vale);
        v.subscribe("/topic/altro");
        await().atMost(5, TimeUnit.SECONDS).until(() -> !v.isConnected());
    }

    @Test
    void unMessaggioInviatoViaRestArrivaSulCanaleDopoIlCommit() throws Exception {
        String vale = TestUsers.register(mvc, "Vale");
        UUID tripId = TestTrips.create(mvc, vale, "Roma");
        LiveTestClient v = LiveTestClient.connect(port, vale);
        BlockingQueue<String> q = v.subscribe("/topic/trips/" + tripId);
        Thread.sleep(300);
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/api/trips/" + tripId + "/messages")
                .header("Authorization", "Bearer " + vale).contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                .content("{\"content\":\"Ciao\"}"));
        String frame = q.poll(5, TimeUnit.SECONDS);
        assertThat(frame).contains("\"type\":\"message.created\"").contains("\"content\":\"Ciao\"").contains("\"authorName\":\"Vale\"");
        v.disconnect();
    }

    @Test
    void staScrivendoArrivaUnaVoltaOgniDueSecondi() throws Exception {
        String vale = TestUsers.register(mvc, "Vale");
        String marco = TestUsers.register(mvc, "Marco");
        UUID tripId = TestTrips.create(mvc, vale, "Roma");
        TestTrips.join(mvc, marco, TestTrips.inviteCode(mvc, vale, tripId));
        LiveTestClient v = LiveTestClient.connect(port, vale);
        LiveTestClient m = LiveTestClient.connect(port, marco);
        BlockingQueue<String> q = v.subscribe("/topic/trips/" + tripId);
        Thread.sleep(300);
        for (int i = 0; i < 3; i++) m.send("/app/trips/" + tripId + "/typing");
        assertThat(q.poll(5, TimeUnit.SECONDS)).contains("\"type\":\"typing\"").contains("\"name\":\"Marco\"");
        assertThat(q.poll(1, TimeUnit.SECONDS)).isNull();
        v.disconnect(); m.disconnect();
    }
}
