package com.splittrip.trip;

import com.splittrip.IntegrationTest;
import com.splittrip.TestTrips;
import com.splittrip.TestUsers;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.not;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class TripLifecycleTest extends IntegrationTest {

    @Test
    void loStatoAvanzaMaNonTornaIndietro() throws Exception {
        String vale = TestUsers.register(mvc, "Vale");
        UUID tripId = TestTrips.create(mvc, vale, "Roma");

        mvc.perform(patch("/api/trips/" + tripId).header("Authorization", "Bearer " + vale)
                .contentType(APPLICATION_JSON).content("{\"status\":\"ONGOING\",\"name\":\"Roma!\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ONGOING"))
                .andExpect(jsonPath("$.name").value("Roma!"));

        mvc.perform(patch("/api/trips/" + tripId).header("Authorization", "Bearer " + vale)
                .contentType(APPLICATION_JSON).content("{\"status\":\"PLANNING\"}"))
                .andExpect(status().isConflict());
    }

    @Test
    void soloLOrganizzatoreModifica() throws Exception {
        String vale = TestUsers.register(mvc, "Vale");
        String marco = TestUsers.register(mvc, "Marco");
        UUID tripId = TestTrips.create(mvc, vale, "Roma");
        TestTrips.join(mvc, marco, TestTrips.inviteCode(mvc, vale, tripId));

        mvc.perform(patch("/api/trips/" + tripId).header("Authorization", "Bearer " + marco)
                .contentType(APPLICATION_JSON).content("{\"name\":\"Hack\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void cancellazioneSoloInPlanning() throws Exception {
        String vale = TestUsers.register(mvc, "Vale");
        UUID tripId = TestTrips.create(mvc, vale, "Roma");
        mvc.perform(patch("/api/trips/" + tripId).header("Authorization", "Bearer " + vale)
                .contentType(APPLICATION_JSON).content("{\"status\":\"ONGOING\"}")).andExpect(status().isOk());
        mvc.perform(delete("/api/trips/" + tripId).header("Authorization", "Bearer " + vale))
                .andExpect(status().isConflict());

        UUID tripId2 = TestTrips.create(mvc, vale, "Parigi");
        mvc.perform(delete("/api/trips/" + tripId2).header("Authorization", "Bearer " + vale))
                .andExpect(status().isNoContent());
        mvc.perform(get("/api/trips/" + tripId2).header("Authorization", "Bearer " + vale))
                .andExpect(status().isNotFound());
    }

    @Test
    void joinConCodiceMinuscoloEConSpaziEIdempotente() throws Exception {
        String vale = TestUsers.register(mvc, "Vale");
        String marco = TestUsers.register(mvc, "Marco");
        UUID tripId = TestTrips.create(mvc, vale, "Roma");
        String code = TestTrips.inviteCode(mvc, vale, tripId);
        String sloppy = "  " + code.toLowerCase() + " ";

        mvc.perform(get("/api/trips/join-preview").param("code", sloppy).header("Authorization", "Bearer " + marco))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Roma"))
                .andExpect(jsonPath("$.memberCount").value(1));

        for (int i = 0; i < 2; i++) {
            mvc.perform(post("/api/trips/join").header("Authorization", "Bearer " + marco)
                    .contentType(APPLICATION_JSON).content("{\"code\":\"" + sloppy + "\"}"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(tripId.toString()))
                    .andExpect(jsonPath("$.participants", hasSize(2)));
        }
    }

    @Test
    void codiceInesistenteDa404EViaggioChiuso409() throws Exception {
        String vale = TestUsers.register(mvc, "Vale");
        String marco = TestUsers.register(mvc, "Marco");
        mvc.perform(get("/api/trips/join-preview").param("code", "ZZZZ-ZZZZ").header("Authorization", "Bearer " + marco))
                .andExpect(status().isNotFound());

        UUID tripId = TestTrips.create(mvc, vale, "Roma");
        String code = TestTrips.inviteCode(mvc, vale, tripId);
        mvc.perform(patch("/api/trips/" + tripId).header("Authorization", "Bearer " + vale)
                .contentType(APPLICATION_JSON).content("{\"status\":\"CLOSED\"}")).andExpect(status().isOk());
        mvc.perform(post("/api/trips/join").header("Authorization", "Bearer " + marco)
                .contentType(APPLICATION_JSON).content("{\"code\":\"" + code + "\"}"))
                .andExpect(status().isConflict());
    }

    @Test
    void rigenerareIlCodiceInvalidaIlVecchio() throws Exception {
        String vale = TestUsers.register(mvc, "Vale");
        String marco = TestUsers.register(mvc, "Marco");
        UUID tripId = TestTrips.create(mvc, vale, "Roma");
        String old = TestTrips.inviteCode(mvc, vale, tripId);

        mvc.perform(post("/api/trips/" + tripId + "/invite-code/regenerate").header("Authorization", "Bearer " + vale))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.inviteCode").value(not(old)));
        mvc.perform(post("/api/trips/join").header("Authorization", "Bearer " + marco)
                .contentType(APPLICATION_JSON).content("{\"code\":\"" + old + "\"}"))
                .andExpect(status().isNotFound());
    }
}
