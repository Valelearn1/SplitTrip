package com.splittrip.chat;

import com.splittrip.IntegrationTest;
import com.splittrip.TestTrips;
import com.splittrip.TestUsers;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.UUID;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class ReactionControllerTest extends IntegrationTest {

    String send(String token, UUID tripId, String content) throws Exception {
        String body = mvc.perform(post("/api/trips/" + tripId + "/messages").header("Authorization", "Bearer " + token)
                .contentType(APPLICATION_JSON).content("{\"content\":\"" + content + "\"}")).andReturn().getResponse().getContentAsString();
        return TestUsers.extract(body, "\"id\":\"([^\"]+)\"");
    }

    @Test
    void metteTogliEConta() throws Exception {
        String vale = TestUsers.register(mvc, "Vale");
        String marco = TestUsers.register(mvc, "Marco");
        UUID tripId = TestTrips.create(mvc, vale, "Roma");
        TestTrips.join(mvc, marco, TestTrips.inviteCode(mvc, vale, tripId));
        String id = send(vale, tripId, "Ci vediamo alle 20");
        String base = "/api/trips/" + tripId + "/messages/" + id + "/reactions/";

        mvc.perform(post(base + "👍").header("Authorization", "Bearer " + vale)).andExpect(status().isNoContent());
        mvc.perform(post(base + "👍").header("Authorization", "Bearer " + vale)).andExpect(status().isNoContent()); // idempotente
        mvc.perform(post(base + "👍").header("Authorization", "Bearer " + marco)).andExpect(status().isNoContent());
        mvc.perform(post(base + "\u2764").header("Authorization", "Bearer " + marco)).andExpect(status().isNoContent()); // «❤» senza U+FE0F, come da alcune tastiere
        mvc.perform(get("/api/trips/" + tripId + "/messages").header("Authorization", "Bearer " + vale))
                .andExpect(jsonPath("$.items[0].reactions", hasSize(2)))
                .andExpect(jsonPath("$.items[0].reactions[0].emoji").value("👍"))
                .andExpect(jsonPath("$.items[0].reactions[0].count").value(2))
                .andExpect(jsonPath("$.items[0].reactions[0].participantIds", hasSize(2)))
                .andExpect(jsonPath("$.items[0].reactions[1].emoji").value("❤️"));
        mvc.perform(delete(base + "👍").header("Authorization", "Bearer " + vale)).andExpect(status().isNoContent());
        mvc.perform(delete(base + "👍").header("Authorization", "Bearer " + vale)).andExpect(status().isNoContent()); // idempotente
        mvc.perform(get("/api/trips/" + tripId + "/messages").header("Authorization", "Bearer " + vale))
                .andExpect(jsonPath("$.items[0].reactions[0].count").value(1));
        // le reazioni non sono messaggi non letti
        mvc.perform(get("/api/trips/" + tripId + "/messages/unread-count").header("Authorization", "Bearer " + marco))
                .andExpect(jsonPath("$.count").value(1)); // solo il messaggio di Vale
    }

    @Test
    void erroriEmojiEliminatoEventoViaggioChiuso() throws Exception {
        String vale = TestUsers.register(mvc, "Vale");
        String marco = TestUsers.register(mvc, "Marco");
        String estraneo = TestUsers.register(mvc, "Estraneo");
        UUID tripId = TestTrips.create(mvc, vale, "Roma");
        TestTrips.join(mvc, marco, TestTrips.inviteCode(mvc, vale, tripId)); // crea la riga evento «Marco è entrato»
        String id = send(vale, tripId, "Ciao");
        String base = "/api/trips/" + tripId + "/messages/" + id + "/reactions/";
        mvc.perform(post(base + "🚀").header("Authorization", "Bearer " + vale)).andExpect(status().isBadRequest());
        mvc.perform(post(base + "👍").header("Authorization", "Bearer " + estraneo)).andExpect(status().isForbidden());
        // riga evento: niente reazioni
        String events = mvc.perform(get("/api/trips/" + tripId + "/messages").header("Authorization", "Bearer " + vale)).andReturn().getResponse().getContentAsString();
        List<String> eventIds = com.jayway.jsonpath.JsonPath.read(events, "$.items[?(@.kind=='EVENT')].id");
        String eventId = eventIds.getFirst();
        mvc.perform(post("/api/trips/" + tripId + "/messages/" + eventId + "/reactions/👍").header("Authorization", "Bearer " + vale)).andExpect(status().isConflict());
        mvc.perform(delete("/api/trips/" + tripId + "/messages/" + id).header("Authorization", "Bearer " + vale));
        mvc.perform(post(base + "👍").header("Authorization", "Bearer " + vale)).andExpect(status().isConflict());
        String id2 = send(vale, tripId, "Altro");
        mvc.perform(patch("/api/trips/" + tripId).header("Authorization", "Bearer " + vale).contentType(APPLICATION_JSON).content("{\"status\":\"CLOSED\"}"));
        mvc.perform(post("/api/trips/" + tripId + "/messages/" + id2 + "/reactions/👍").header("Authorization", "Bearer " + vale)).andExpect(status().isConflict());
    }
}
