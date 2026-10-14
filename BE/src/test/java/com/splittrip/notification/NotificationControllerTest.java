package com.splittrip.notification;

import com.splittrip.IntegrationTest;
import com.splittrip.TestExpenses;
import com.splittrip.TestTrips;
import com.splittrip.TestUsers;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class NotificationControllerTest extends IntegrationTest {

    @Test
    void spesaRimborsoEIngressoGeneranoNotificheMaNonAChiAgisce() throws Exception {
        String vale = TestUsers.register(mvc, "Vale");
        String marco = TestUsers.register(mvc, "Marco");
        UUID tripId = TestTrips.create(mvc, vale, "Roma");
        String code = TestTrips.inviteCode(mvc, vale, tripId);
        TestTrips.join(mvc, marco, code);                      // → Vale: «Marco ora fa parte del viaggio»
        UUID valeP = TestTrips.participantOf(mvc, vale, tripId);
        UUID marcoP = TestTrips.participantOf(mvc, marco, tripId);
        String pina = mvc.perform(post("/api/trips/" + tripId + "/participants").header("Authorization", "Bearer " + vale)
                .contentType(APPLICATION_JSON).content("{\"displayName\":\"Nonna Pina\"}"))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        UUID pinaP = UUID.fromString(TestUsers.extract(pina, "\"id\":\"([^\"]+)\""));

        UUID expenseId = TestExpenses.createEqual(mvc, marco, tripId, "Cena", "45.00", marcoP, valeP, marcoP, pinaP); // → Vale, non Marco, non Pina (senza account)
        mvc.perform(post("/api/trips/" + tripId + "/settlements").header("Authorization", "Bearer " + vale)
                .contentType(APPLICATION_JSON).content("""
                {"fromParticipantId":"%s","toParticipantId":"%s","amount":15.00,"date":"2026-11-03"}
                """.formatted(valeP, marcoP))).andExpect(status().isCreated());     // → Marco (riceve), non Vale (ha registrato)

        mvc.perform(get("/api/notifications").header("Authorization", "Bearer " + vale))
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].type").value("EXPENSE_ADDED"))
                .andExpect(jsonPath("$[0].message").value("Marco ha aggiunto «Cena» (tua quota 15,00 €)"))
                .andExpect(jsonPath("$[0].link").value("/trips/" + tripId + "/expenses/" + expenseId + "/edit"))
                .andExpect(jsonPath("$[1].type").value("PARTICIPANT_JOINED"));
        mvc.perform(get("/api/notifications").header("Authorization", "Bearer " + marco))
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].type").value("SETTLEMENT_ADDED"))
                .andExpect(jsonPath("$[0].message").value(containsString("15,00 € a te")));
        mvc.perform(get("/api/notifications/unread-count").header("Authorization", "Bearer " + vale))
                .andExpect(jsonPath("$.count").value(2));
    }

    @Test
    void lettureSoloDelDestinatario() throws Exception {
        String vale = TestUsers.register(mvc, "Vale");
        String marco = TestUsers.register(mvc, "Marco");
        UUID tripId = TestTrips.create(mvc, vale, "Roma");
        TestTrips.join(mvc, marco, TestTrips.inviteCode(mvc, vale, tripId));
        String body = mvc.perform(get("/api/notifications").header("Authorization", "Bearer " + vale))
                .andExpect(jsonPath("$", hasSize(1))).andReturn().getResponse().getContentAsString();
        UUID nid = UUID.fromString(TestUsers.extract(body, "\"id\":\"([^\"]+)\""));
        mvc.perform(patch("/api/notifications/" + nid + "/read").header("Authorization", "Bearer " + marco))
                .andExpect(status().isNotFound());
        mvc.perform(patch("/api/notifications/" + nid + "/read").header("Authorization", "Bearer " + vale))
                .andExpect(status().isNoContent());
        mvc.perform(get("/api/notifications").param("unread", "true").header("Authorization", "Bearer " + vale))
                .andExpect(jsonPath("$", hasSize(0)));
        mvc.perform(post("/api/notifications/read-all").header("Authorization", "Bearer " + vale))
                .andExpect(status().isNoContent());
        mvc.perform(get("/api/notifications/unread-count").header("Authorization", "Bearer " + vale))
                .andExpect(jsonPath("$.count").value(0));
    }
}
