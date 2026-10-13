package com.splittrip.expense;

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

class SettlementControllerTest extends IntegrationTest {

    String vale, marco, giulia;
    UUID valeId, marcoId, tripId;

    @BeforeEach
    void setUp() throws Exception {
        vale = TestUsers.register(mvc, "Vale");
        marco = TestUsers.register(mvc, "Marco");
        giulia = TestUsers.register(mvc, "Giulia");
        valeId = TestUsers.idOf(mvc, vale);
        marcoId = TestUsers.idOf(mvc, marco);
        tripId = TestTrips.create(mvc, vale, "Roma");
        String code = TestTrips.inviteCode(mvc, vale, tripId);
        TestTrips.join(mvc, marco, code);
        TestTrips.join(mvc, giulia, code);
    }

    String body(UUID from, UUID to, String amount) {
        return """
                {"fromUserId":"%s","toUserId":"%s","amount":%s,"date":"2026-11-04","note":"contanti"}
                """.formatted(from, to, amount);
    }

    @Test
    void creaListaECancella() throws Exception {
        String created = mvc.perform(post("/api/trips/" + tripId + "/settlements").header("Authorization", "Bearer " + marco)
                .contentType(APPLICATION_JSON).content(body(marcoId, valeId, "10.00")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.fromUserId").value(marcoId.toString()))
                .andExpect(jsonPath("$.fromName").value("Marco"))
                .andExpect(jsonPath("$.toName").value("Vale"))
                .andExpect(jsonPath("$.amount").value(10.00))
                .andReturn().getResponse().getContentAsString();
        UUID id = UUID.fromString(TestUsers.extract(created, "\"id\":\"([^\"]+)\""));

        mvc.perform(get("/api/trips/" + tripId + "/settlements").header("Authorization", "Bearer " + vale))
                .andExpect(status().isOk()).andExpect(jsonPath("$", hasSize(1)));

        mvc.perform(delete("/api/trips/" + tripId + "/settlements/" + id).header("Authorization", "Bearer " + giulia))
                .andExpect(status().isForbidden());
        mvc.perform(delete("/api/trips/" + tripId + "/settlements/" + id).header("Authorization", "Bearer " + marco))
                .andExpect(status().isNoContent());
        mvc.perform(get("/api/trips/" + tripId + "/settlements").header("Authorization", "Bearer " + vale))
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    void rimborsoASeStessiDa400() throws Exception {
        mvc.perform(post("/api/trips/" + tripId + "/settlements").header("Authorization", "Bearer " + marco)
                .contentType(APPLICATION_JSON).content(body(marcoId, marcoId, "10.00")))
                .andExpect(status().isBadRequest());
    }

    @Test
    void utentiDevonoEssereMembri() throws Exception {
        mvc.perform(post("/api/trips/" + tripId + "/settlements").header("Authorization", "Bearer " + marco)
                .contentType(APPLICATION_JSON).content(body(marcoId, UUID.randomUUID(), "10.00")))
                .andExpect(status().isBadRequest());
    }

    @Test
    void viaggioChiusoDa409() throws Exception {
        mvc.perform(patch("/api/trips/" + tripId).header("Authorization", "Bearer " + vale)
                .contentType(APPLICATION_JSON).content("{\"status\":\"CLOSED\"}")).andExpect(status().isOk());
        mvc.perform(post("/api/trips/" + tripId + "/settlements").header("Authorization", "Bearer " + marco)
                .contentType(APPLICATION_JSON).content(body(marcoId, valeId, "10.00")))
                .andExpect(status().isConflict());
    }
}
