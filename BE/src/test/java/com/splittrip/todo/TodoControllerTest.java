package com.splittrip.todo;

import com.splittrip.IntegrationTest;
import com.splittrip.TestTrips;
import com.splittrip.TestUsers;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class TodoControllerTest extends IntegrationTest {

    String vale, marco;
    UUID tripId, marcoP, pinaP;

    @BeforeEach
    void setUp() throws Exception {
        vale = TestUsers.register(mvc, "Vale");
        marco = TestUsers.register(mvc, "Marco");
        tripId = TestTrips.create(mvc, vale, "Roma");
        TestTrips.join(mvc, marco, TestTrips.inviteCode(mvc, vale, tripId));
        marcoP = TestTrips.participantOf(mvc, marco, tripId);
        String pina = mvc.perform(post("/api/trips/" + tripId + "/participants").header("Authorization", "Bearer " + vale)
                .contentType(APPLICATION_JSON).content("{\"displayName\":\"Nonna Pina\"}")).andReturn().getResponse().getContentAsString();
        pinaP = UUID.fromString(TestUsers.extract(pina, "\"id\":\"([^\"]+)\""));
    }

    UUID createList(String token, String title, String type) throws Exception {
        String body = mvc.perform(post("/api/trips/" + tripId + "/todo-lists").header("Authorization", "Bearer " + token)
                .contentType(APPLICATION_JSON).content("{\"title\":\"" + title + "\",\"type\":\"" + type + "\"}"))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        return UUID.fromString(TestUsers.extract(body, "\"id\":\"([^\"]+)\""));
    }

    @Test
    void listaVociAssegnazioneAncheASenzaAccountENotifica() throws Exception {
        UUID lid = createList(vale, "Valigia", "PACKING");
        String item = mvc.perform(post("/api/trips/" + tripId + "/todo-lists/" + lid + "/items").header("Authorization", "Bearer " + vale)
                .contentType(APPLICATION_JSON).content("{\"text\":\"Phon\",\"assigneeParticipantId\":\"" + marcoP + "\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.assigneeName").value("Marco"))
                .andReturn().getResponse().getContentAsString();
        UUID iid = UUID.fromString(TestUsers.extract(item, "\"id\":\"([^\"]+)\""));
        mvc.perform(patch("/api/trips/" + tripId + "/todo-lists/" + lid + "/items/" + iid).header("Authorization", "Bearer " + marco)
                .contentType(APPLICATION_JSON).content("{\"done\":true,\"assigneeParticipantId\":\"" + pinaP + "\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.done").value(true))
                .andExpect(jsonPath("$.assigneeName").value("Nonna Pina"));
        mvc.perform(patch("/api/trips/" + tripId + "/todo-lists/" + lid + "/items/" + iid).header("Authorization", "Bearer " + marco)
                .contentType(APPLICATION_JSON).content("{\"clearAssignee\":true}"))
                .andExpect(jsonPath("$.assigneeParticipantId").isEmpty());
        mvc.perform(get("/api/trips/" + tripId + "/todo-lists").header("Authorization", "Bearer " + marco))
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].items", hasSize(1)))
                .andExpect(jsonPath("$[0].items[0].text").value("Phon"));
        // Marco ha ricevuto la notifica dell'assegnazione fatta da Vale
        mvc.perform(get("/api/notifications").header("Authorization", "Bearer " + marco))
                .andExpect(jsonPath("$[0].type").value("TODO_ASSIGNED"))
                .andExpect(jsonPath("$[0].message").value("Vale ti ha assegnato «Phon» (Valigia)"));
    }

    @Test
    void assegnatarioDiAltroViaggioOCheHaLasciatoDa400() throws Exception {
        UUID lid = createList(vale, "Da fare", "GENERAL");
        UUID other = TestTrips.create(mvc, marco, "Parigi");
        UUID marcoInParis = TestTrips.participantOf(mvc, marco, other);
        mvc.perform(post("/api/trips/" + tripId + "/todo-lists/" + lid + "/items").header("Authorization", "Bearer " + vale)
                .contentType(APPLICATION_JSON).content("{\"text\":\"Treno\",\"assigneeParticipantId\":\"" + marcoInParis + "\"}"))
                .andExpect(status().isBadRequest());
        mvc.perform(delete("/api/trips/" + tripId + "/participants/" + marcoP).header("Authorization", "Bearer " + marco))
                .andExpect(status().isNoContent());
        mvc.perform(post("/api/trips/" + tripId + "/todo-lists/" + lid + "/items").header("Authorization", "Bearer " + vale)
                .contentType(APPLICATION_JSON).content("{\"text\":\"Treno\",\"assigneeParticipantId\":\"" + marcoP + "\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void cancellareLaListaRimuoveLeVociEViaggioChiusoBloccaLeNuove() throws Exception {
        UUID lid = createList(vale, "Valigia", "PACKING");
        mvc.perform(post("/api/trips/" + tripId + "/todo-lists/" + lid + "/items").header("Authorization", "Bearer " + vale)
                .contentType(APPLICATION_JSON).content("{\"text\":\"Phon\"}")).andExpect(status().isCreated());
        mvc.perform(delete("/api/trips/" + tripId + "/todo-lists/" + lid).header("Authorization", "Bearer " + marco))
                .andExpect(status().isNoContent());
        mvc.perform(get("/api/trips/" + tripId + "/todo-lists").header("Authorization", "Bearer " + vale))
                .andExpect(jsonPath("$", hasSize(0)));
        mvc.perform(patch("/api/trips/" + tripId).header("Authorization", "Bearer " + vale)
                .contentType(APPLICATION_JSON).content("{\"status\":\"CLOSED\"}")).andExpect(status().isOk());
        mvc.perform(post("/api/trips/" + tripId + "/todo-lists").header("Authorization", "Bearer " + vale)
                .contentType(APPLICATION_JSON).content("{\"title\":\"X\",\"type\":\"GENERAL\"}"))
                .andExpect(status().isConflict());
    }

    @Test
    void unCampoAssenteNonToglieLAssegnazione() throws Exception {
        UUID lid = createList(vale, "Valigia", "PACKING");
        String item = mvc.perform(post("/api/trips/" + tripId + "/todo-lists/" + lid + "/items").header("Authorization", "Bearer " + vale)
                .contentType(APPLICATION_JSON).content("{\"text\":\"Phon\",\"assigneeParticipantId\":\"" + marcoP + "\"}"))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        UUID iid = UUID.fromString(TestUsers.extract(item, "\"id\":\"([^\"]+)\""));
        mvc.perform(patch("/api/trips/" + tripId + "/todo-lists/" + lid + "/items/" + iid).header("Authorization", "Bearer " + marco)
                .contentType(APPLICATION_JSON).content("{\"done\":true}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.done").value(true))
                .andExpect(jsonPath("$.assigneeParticipantId").value(marcoP.toString()));
    }
}
