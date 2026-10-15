package com.splittrip.chat;

import com.splittrip.IntegrationTest;
import com.splittrip.TestTrips;
import com.splittrip.TestUsers;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.simple.JdbcClient;

import java.util.UUID;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.nullValue;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class ChatControllerTest extends IntegrationTest {

    @Autowired JdbcClient jdbc;

    String send(String token, UUID tripId, String content) throws Exception {
        String body = mvc.perform(post("/api/trips/" + tripId + "/messages").header("Authorization", "Bearer " + token)
                .contentType(APPLICATION_JSON).content("{\"content\":\"" + content + "\"}"))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        return TestUsers.extract(body, "\"id\":\"([^\"]+)\"");
    }

    @Test
    void invioStoricoPaginatoENonLetti() throws Exception {
        String vale = TestUsers.register(mvc, "Vale");
        String marco = TestUsers.register(mvc, "Marco");
        UUID tripId = TestTrips.create(mvc, vale, "Roma");
        TestTrips.join(mvc, marco, TestTrips.inviteCode(mvc, vale, tripId));

        mvc.perform(post("/api/trips/" + tripId + "/messages").header("Authorization", "Bearer " + vale)
                        .contentType(APPLICATION_JSON).content("{\"content\":\"  Ci vediamo alle 20  \"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.content").value("Ci vediamo alle 20"))
                .andExpect(jsonPath("$.authorName").value("Vale"))
                .andExpect(jsonPath("$.kind").value("TEXT"))
                .andExpect(jsonPath("$.deleted").value(false));
        for (int i = 1; i <= 3; i++) send(marco, tripId, "m" + i);

        // Vale non ha mai aperto la chat: i 3 di Marco (e l'evento di ingresso, Task 4) sono non letti; i propri no
        mvc.perform(get("/api/trips/" + tripId + "/messages/unread-count").header("Authorization", "Bearer " + vale))
                .andExpect(jsonPath("$.count").value(org.hamcrest.Matchers.greaterThanOrEqualTo(3)));
        mvc.perform(post("/api/trips/" + tripId + "/messages/read").header("Authorization", "Bearer " + vale)).andExpect(status().isNoContent());
        mvc.perform(get("/api/trips/" + tripId + "/messages/unread-count").header("Authorization", "Bearer " + vale))
                .andExpect(jsonPath("$.count").value(0));

        // pagina da 2, più recenti per primi, poi la successiva con before
        String first = mvc.perform(get("/api/trips/" + tripId + "/messages?size=2").header("Authorization", "Bearer " + vale))
                .andExpect(jsonPath("$.items", hasSize(2)))
                .andExpect(jsonPath("$.items[0].content").value("m3"))
                .andExpect(jsonPath("$.hasMore").value(true))
                .andReturn().getResponse().getContentAsString();
        String oldestShown = com.jayway.jsonpath.JsonPath.read(first, "$.items[1].id");
        mvc.perform(get("/api/trips/" + tripId + "/messages?size=2&before=" + oldestShown).header("Authorization", "Bearer " + vale))
                .andExpect(jsonPath("$.items[0].content").value("m1"));
    }

    @Test
    void eliminareCancellaDavveroIlTestoESoloLAutorePuo() throws Exception {
        String vale = TestUsers.register(mvc, "Vale");
        String marco = TestUsers.register(mvc, "Marco");
        UUID tripId = TestTrips.create(mvc, vale, "Roma");
        TestTrips.join(mvc, marco, TestTrips.inviteCode(mvc, vale, tripId));
        String id = send(vale, tripId, "Numero della carta 1234");

        mvc.perform(delete("/api/trips/" + tripId + "/messages/" + id).header("Authorization", "Bearer " + marco))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.detail").value("Puoi eliminare solo i tuoi messaggi"));
        mvc.perform(delete("/api/trips/" + tripId + "/messages/" + id).header("Authorization", "Bearer " + vale))
                .andExpect(status().isNoContent());
        assertThat(jdbc.sql("select content from chat_messages where id = ?::uuid").param(id).query(String.class).optional()).isEmpty();
        mvc.perform(get("/api/trips/" + tripId + "/messages").header("Authorization", "Bearer " + marco))
                .andExpect(jsonPath("$.items[?(@.id=='" + id + "')].deleted").value(true))
                .andExpect(jsonPath("$.items[?(@.id=='" + id + "')].content").value(org.hamcrest.Matchers.contains(nullValue())));
    }

    @Test
    void erroriDiValidazioneAccessoEViaggioChiuso() throws Exception {
        String vale = TestUsers.register(mvc, "Vale");
        String estraneo = TestUsers.register(mvc, "Estraneo");
        UUID tripId = TestTrips.create(mvc, vale, "Roma");
        String url = "/api/trips/" + tripId + "/messages";

        mvc.perform(post(url).header("Authorization", "Bearer " + vale).contentType(APPLICATION_JSON).content("{\"content\":\"   \"}"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.errors[0].field").value("content"));
        mvc.perform(post(url).header("Authorization", "Bearer " + vale).contentType(APPLICATION_JSON).content("{\"content\":\"" + "x".repeat(1001) + "\"}"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.errors[0].field").value("content"));
        mvc.perform(get(url).header("Authorization", "Bearer " + estraneo)).andExpect(status().isForbidden());
        mvc.perform(post(url).header("Authorization", "Bearer " + estraneo).contentType(APPLICATION_JSON).content("{\"content\":\"ciao\"}"))
                .andExpect(status().isForbidden());

        mvc.perform(patch("/api/trips/" + tripId).header("Authorization", "Bearer " + vale)
                .contentType(APPLICATION_JSON).content("{\"status\":\"CLOSED\"}")).andExpect(status().isOk());
        mvc.perform(post(url).header("Authorization", "Bearer " + vale).contentType(APPLICATION_JSON).content("{\"content\":\"ciao\"}"))
                .andExpect(status().isConflict());
        mvc.perform(get(url).header("Authorization", "Bearer " + vale)).andExpect(status().isOk()); // la lettura resta
    }

    @Test
    void piuDiVentiMessaggiAlMinutoDanno429() throws Exception {
        String vale = TestUsers.register(mvc, "Vale");
        UUID tripId = TestTrips.create(mvc, vale, "Roma");
        for (int i = 0; i < 20; i++) send(vale, tripId, "m" + i);
        mvc.perform(post("/api/trips/" + tripId + "/messages").header("Authorization", "Bearer " + vale)
                        .contentType(APPLICATION_JSON).content("{\"content\":\"uno di troppo\"}"))
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.detail").value("Stai scrivendo troppo in fretta: riprova tra poco"));
    }
}
