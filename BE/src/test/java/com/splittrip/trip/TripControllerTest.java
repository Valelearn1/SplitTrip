package com.splittrip.trip;

import com.splittrip.IntegrationTest;
import com.splittrip.TestTrips;
import com.splittrip.TestUsers;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.matchesPattern;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class TripControllerTest extends IntegrationTest {

    @Test
    void creaViaggioIlCreatoreEOrganizzatore() throws Exception {
        String token = TestUsers.register(mvc, "Vale");
        mvc.perform(post("/api/trips").header("Authorization", "Bearer " + token)
                .contentType(APPLICATION_JSON).content("""
                {"name":"Roma 2026","destination":"Roma","startDate":"2026-11-01","endDate":"2026-11-05"}
                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PLANNING"))
                .andExpect(jsonPath("$.currency").value("EUR"))
                .andExpect(jsonPath("$.inviteCode").value(matchesPattern("^[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$")))
                .andExpect(jsonPath("$.members", hasSize(1)))
                .andExpect(jsonPath("$.members[0].role").value("ORGANIZER"))
                .andExpect(jsonPath("$.members[0].displayName").value("Vale"));
    }

    @Test
    void dateInvertiteDa400() throws Exception {
        String token = TestUsers.register(mvc, "Vale");
        mvc.perform(post("/api/trips").header("Authorization", "Bearer " + token)
                .contentType(APPLICATION_JSON).content("""
                {"name":"Roma","destination":"Roma","startDate":"2026-11-05","endDate":"2026-11-01"}
                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void listaMostraSoloIMieiViaggi() throws Exception {
        String vale = TestUsers.register(mvc, "Vale");
        String marco = TestUsers.register(mvc, "Marco");
        TestTrips.create(mvc, vale, "Roma");
        TestTrips.create(mvc, marco, "Parigi");

        mvc.perform(get("/api/trips").header("Authorization", "Bearer " + vale))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name").value("Roma"))
                .andExpect(jsonPath("$[0].memberCount").value(1))
                .andExpect(jsonPath("$[0].myRole").value("ORGANIZER"));
    }

    @Test
    void nonMembroDa403EViaggioInesistente404() throws Exception {
        String vale = TestUsers.register(mvc, "Vale");
        String marco = TestUsers.register(mvc, "Marco");
        UUID tripId = TestTrips.create(mvc, vale, "Roma");

        mvc.perform(get("/api/trips/" + tripId).header("Authorization", "Bearer " + marco))
                .andExpect(status().isForbidden());
        mvc.perform(get("/api/trips/" + UUID.randomUUID()).header("Authorization", "Bearer " + marco))
                .andExpect(status().isNotFound());
    }
}
