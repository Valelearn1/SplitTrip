package com.splittrip.trip;

import com.splittrip.IntegrationTest;
import com.splittrip.TestExpenses;
import com.splittrip.TestTrips;
import com.splittrip.TestUsers;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class ParticipantControllerTest extends IntegrationTest {

    String vale, marco;
    UUID tripId, valeP, marcoP;

    @BeforeEach
    void setUp() throws Exception {
        vale = TestUsers.register(mvc, "Vale");
        marco = TestUsers.register(mvc, "Marco");
        tripId = TestTrips.create(mvc, vale, "Roma");
        TestTrips.join(mvc, marco, TestTrips.inviteCode(mvc, vale, tripId));
        valeP = TestTrips.participantOf(mvc, vale, tripId);
        marcoP = TestTrips.participantOf(mvc, marco, tripId);
    }

    @Test
    void lOrganizzatoreAggiungeUnPartecipanteSenzaAccountCheEntraNeiSoldi() throws Exception {
        String body = mvc.perform(post("/api/trips/" + tripId + "/participants").header("Authorization", "Bearer " + vale)
                .contentType(APPLICATION_JSON).content("{\"displayName\":\"Nonna Pina\",\"defaultWeight\":0.5}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.userId").isEmpty())
                .andExpect(jsonPath("$.role").value("MEMBER"))
                .andExpect(jsonPath("$.defaultWeight").value(0.5))
                .andReturn().getResponse().getContentAsString();
        UUID pinaP = UUID.fromString(TestUsers.extract(body, "\"id\":\"([^\"]+)\""));

        TestExpenses.createEqual(mvc, vale, tripId, "Gelato", "30.00", valeP, valeP, marcoP, pinaP);
        mvc.perform(get("/api/trips/" + tripId + "/balances").header("Authorization", "Bearer " + marco))
                .andExpect(jsonPath("$.balances[?(@.displayName=='Nonna Pina')].net").value(-10.00));
        mvc.perform(post("/api/trips/" + tripId + "/settlements").header("Authorization", "Bearer " + marco)
                .contentType(APPLICATION_JSON).content("""
                {"fromParticipantId":"%s","toParticipantId":"%s","amount":10.00,"date":"2026-11-03"}
                """.formatted(pinaP, valeP)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.fromName").value("Nonna Pina"));
    }

    @Test
    void unMembroNonAggiungePartecipanti() throws Exception {
        mvc.perform(post("/api/trips/" + tripId + "/participants").header("Authorization", "Bearer " + marco)
                .contentType(APPLICATION_JSON).content("{\"displayName\":\"Nonna Pina\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void ciascunoModificaSeStessoLOrganizzatoreChiunque() throws Exception {
        mvc.perform(patch("/api/trips/" + tripId + "/participants/" + marcoP).header("Authorization", "Bearer " + marco)
                .contentType(APPLICATION_JSON).content("{\"arrivalDate\":\"2026-11-03\",\"defaultWeight\":2}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.arrivalDate").value("2026-11-03"))
                .andExpect(jsonPath("$.defaultWeight").value(2));
        mvc.perform(patch("/api/trips/" + tripId + "/participants/" + valeP).header("Authorization", "Bearer " + marco)
                .contentType(APPLICATION_JSON).content("{\"displayName\":\"Hack\"}"))
                .andExpect(status().isForbidden());
        mvc.perform(patch("/api/trips/" + tripId + "/participants/" + marcoP).header("Authorization", "Bearer " + vale)
                .contentType(APPLICATION_JSON).content("{\"displayName\":\"Marco R.\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.displayName").value("Marco R."));
        mvc.perform(patch("/api/trips/" + tripId + "/participants/" + marcoP).header("Authorization", "Bearer " + vale)
                .contentType(APPLICATION_JSON).content("{\"arrivalDate\":\"2026-11-04\",\"departureDate\":\"2026-11-02\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors[0].field").value("departureDate"));
    }

    @Test
    void scollegareLAccountTogliELAccessoMaNonISoldi() throws Exception {
        TestExpenses.createEqual(mvc, marco, tripId, "Cena", "20.00", marcoP, valeP, marcoP);
        mvc.perform(post("/api/trips/" + tripId + "/participants/" + marcoP + "/unlink").header("Authorization", "Bearer " + vale))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").isEmpty())
                .andExpect(jsonPath("$.displayName").value("Marco"));
        // il token di Marco è ancora valido, ma non è più nel viaggio
        mvc.perform(get("/api/trips/" + tripId).header("Authorization", "Bearer " + marco))
                .andExpect(status().isForbidden());
        mvc.perform(get("/api/trips/" + tripId + "/balances").header("Authorization", "Bearer " + vale))
                .andExpect(jsonPath("$.balances[?(@.displayName=='Marco')].net").value(10.00));
        mvc.perform(post("/api/trips/" + tripId + "/participants/" + marcoP + "/unlink").header("Authorization", "Bearer " + vale))
                .andExpect(status().isBadRequest());
        mvc.perform(post("/api/trips/" + tripId + "/participants/" + valeP + "/unlink").header("Authorization", "Bearer " + vale))
                .andExpect(status().isConflict());
    }

    @Test
    void chiHaLasciatoNonSiModificaENonCompareTraIPartecipanti() throws Exception {
        mvc.perform(delete("/api/trips/" + tripId + "/participants/" + marcoP).header("Authorization", "Bearer " + marco))
                .andExpect(status().isNoContent());
        mvc.perform(get("/api/trips/" + tripId).header("Authorization", "Bearer " + vale))
                .andExpect(jsonPath("$.participants", hasSize(1)));
        mvc.perform(patch("/api/trips/" + tripId + "/participants/" + marcoP).header("Authorization", "Bearer " + vale)
                .contentType(APPLICATION_JSON).content("{\"displayName\":\"Marco\"}"))
                .andExpect(status().isNotFound());
        mvc.perform(get("/api/trips/" + tripId).header("Authorization", "Bearer " + marco))
                .andExpect(status().isForbidden());
    }

    @Test
    void regoleDiUscita() throws Exception {
        String giulia = TestUsers.register(mvc, "Giulia");
        TestTrips.join(mvc, giulia, TestTrips.inviteCode(mvc, vale, tripId));
        UUID giuliaP = TestTrips.participantOf(mvc, giulia, tripId);
        mvc.perform(delete("/api/trips/" + tripId + "/participants/" + giuliaP).header("Authorization", "Bearer " + marco))
                .andExpect(status().isForbidden());
        mvc.perform(delete("/api/trips/" + tripId + "/participants/" + valeP).header("Authorization", "Bearer " + vale))
                .andExpect(status().isConflict());
        TestExpenses.createEqual(mvc, vale, tripId, "Cena", "20.00", valeP, valeP, giuliaP);
        mvc.perform(delete("/api/trips/" + tripId + "/participants/" + giuliaP).header("Authorization", "Bearer " + vale))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.detail").value(containsString("quote")));
        mvc.perform(delete("/api/trips/" + tripId + "/members/" + giuliaP).header("Authorization", "Bearer " + vale))
                .andExpect(status().isNotFound());
    }
}
