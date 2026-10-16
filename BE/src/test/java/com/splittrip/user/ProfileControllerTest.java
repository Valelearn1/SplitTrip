package com.splittrip.user;

import com.splittrip.IntegrationTest;
import com.splittrip.TestExpenses;
import com.splittrip.TestTrips;
import com.splittrip.TestUsers;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class ProfileControllerTest extends IntegrationTest {

    @Test
    void nomeEdEmailConEmailUnica() throws Exception {
        String vale = TestUsers.register(mvc, "Vale");
        String marco = TestUsers.register(mvc, "Marco");
        String marcoEmail = com.jayway.jsonpath.JsonPath.read(mvc.perform(get("/api/me").header("Authorization", "Bearer " + marco)).andReturn().getResponse().getContentAsString(), "$.email");
        mvc.perform(patch("/api/me").header("Authorization", "Bearer " + vale).contentType(APPLICATION_JSON)
                        .content("{\"email\":\"" + marcoEmail.toUpperCase() + "\"}"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.errors[0].field").value("email"));
        mvc.perform(patch("/api/me").header("Authorization", "Bearer " + vale).contentType(APPLICATION_JSON)
                        .content("{\"displayName\":\" Valentina \",\"email\":\"Vale.Nuova@Example.test\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.displayName").value("Valentina")).andExpect(jsonPath("$.email").value("vale.nuova@example.test"));
        // Review Focus 3: il vecchio token resta valido e vede i dati nuovi
        mvc.perform(get("/api/me").header("Authorization", "Bearer " + vale)).andExpect(status().isOk()).andExpect(jsonPath("$.email").value("vale.nuova@example.test"));
        mvc.perform(post("/api/auth/login").contentType(APPLICATION_JSON).content("{\"email\":\"vale.nuova@example.test\",\"password\":\"password1\"}")).andExpect(status().isOk());
    }

    @Test
    void cambioPassword() throws Exception {
        String vale = TestUsers.register(mvc, "Vale");
        String email = com.jayway.jsonpath.JsonPath.read(mvc.perform(get("/api/me").header("Authorization", "Bearer " + vale)).andReturn().getResponse().getContentAsString(), "$.email");
        mvc.perform(post("/api/me/password").header("Authorization", "Bearer " + vale).contentType(APPLICATION_JSON)
                        .content("{\"currentPassword\":\"sbagliata1\",\"newPassword\":\"nuovapass2\"}"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.errors[0].field").value("currentPassword"));
        mvc.perform(post("/api/me/password").header("Authorization", "Bearer " + vale).contentType(APPLICATION_JSON)
                        .content("{\"currentPassword\":\"password1\",\"newPassword\":\"corta\"}"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.errors[0].field").value("newPassword"));
        mvc.perform(post("/api/me/password").header("Authorization", "Bearer " + vale).contentType(APPLICATION_JSON)
                        .content("{\"currentPassword\":\"password1\",\"newPassword\":\"nuovapass2\"}"))
                .andExpect(status().isNoContent());
        mvc.perform(post("/api/auth/login").contentType(APPLICATION_JSON).content("{\"email\":\"" + email + "\",\"password\":\"password1\"}")).andExpect(status().isUnauthorized());
        mvc.perform(post("/api/auth/login").contentType(APPLICATION_JSON).content("{\"email\":\"" + email + "\",\"password\":\"nuovapass2\"}")).andExpect(status().isOk());
        mvc.perform(get("/api/me").header("Authorization", "Bearer " + vale)).andExpect(status().isOk()); // il token vecchio vale fino alla scadenza
    }

    @Test
    void preferenzeEStatistiche() throws Exception {
        String vale = TestUsers.register(mvc, "Vale");
        String marco = TestUsers.register(mvc, "Marco");
        mvc.perform(get("/api/me").header("Authorization", "Bearer " + vale))
                .andExpect(jsonPath("$.preferredCurrency").value("EUR")).andExpect(jsonPath("$.chatSound").value(true)).andExpect(jsonPath("$.reduceMotion").value(false));
        mvc.perform(patch("/api/me/preferences").header("Authorization", "Bearer " + vale).contentType(APPLICATION_JSON)
                        .content("{\"preferredCurrency\":\"USD\",\"chatSound\":false,\"reduceMotion\":true}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.preferredCurrency").value("USD")).andExpect(jsonPath("$.chatSound").value(false)).andExpect(jsonPath("$.reduceMotion").value(true));
        mvc.perform(patch("/api/me/preferences").header("Authorization", "Bearer " + vale).contentType(APPLICATION_JSON)
                        .content("{\"preferredCurrency\":\"euro\"}")).andExpect(status().isBadRequest());

        UUID t1 = TestTrips.create(mvc, vale, "Roma");
        UUID t2 = TestTrips.create(mvc, vale, "Lisbona");
        TestTrips.join(mvc, marco, TestTrips.inviteCode(mvc, vale, t1));
        UUID valeP = TestTrips.participantOf(mvc, vale, t1);
        UUID marcoP = TestTrips.participantOf(mvc, marco, t1);
        TestExpenses.createEqual(mvc, vale, t1, "Cena", "40.00", valeP, valeP, marcoP);   // gruppo 40, mia parte 20
        UUID valeP2 = TestTrips.participantOf(mvc, vale, t2);
        UUID taxi = TestExpenses.createEqual(mvc, vale, t2, "Taxi", "10.00", valeP2, valeP2); // gruppo 10, mia parte 10
        mvc.perform(get("/api/me/stats").header("Authorization", "Bearer " + vale))
                .andExpect(jsonPath("$.trips").value(2))
                .andExpect(jsonPath("$.destinations", hasSize(1)))                          // entrambi «Roma» (TestTrips mette sempre Roma): nomi distinti
                .andExpect(jsonPath("$.spending", hasSize(1)))                               // tutto in euro: una riga sola
                .andExpect(jsonPath("$.spending[0].currency").value("EUR"))
                .andExpect(jsonPath("$.spending[0].groupTotal").value(50.00))
                .andExpect(jsonPath("$.spending[0].myShare").value(30.00))
                .andExpect(jsonPath("$.photos").value(0));
        mvc.perform(get("/api/me/stats").header("Authorization", "Bearer " + marco))
                .andExpect(jsonPath("$.trips").value(1)).andExpect(jsonPath("$.spending[0].groupTotal").value(40.00)).andExpect(jsonPath("$.spending[0].myShare").value(20.00));
        // una spesa nel cestino non conta, né nel totale né nella mia parte
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete("/api/trips/" + t2 + "/expenses/" + taxi)
                .header("Authorization", "Bearer " + vale)).andExpect(status().isNoContent());
        mvc.perform(get("/api/me/stats").header("Authorization", "Bearer " + vale))
                .andExpect(jsonPath("$.spending[0].groupTotal").value(40.00)).andExpect(jsonPath("$.spending[0].myShare").value(20.00));
    }

    @Test
    void conValuteDiverseUnTotalePerValutaMaiSommati() throws Exception {
        String vale = TestUsers.register(mvc, "Vale");
        UUID roma = TestTrips.create(mvc, vale, "Roma");
        String body = mvc.perform(post("/api/trips").header("Authorization", "Bearer " + vale).contentType(APPLICATION_JSON).content("""
                {"name":"Tokyo","destination":"Tokyo","startDate":"2026-11-01","endDate":"2026-11-05","currency":"JPY"}
                """)).andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        UUID tokyo = UUID.fromString(TestUsers.extract(body, "\"id\":\"([^\"]+)\""));
        UUID pRoma = TestTrips.participantOf(mvc, vale, roma);
        UUID pTokyo = TestTrips.participantOf(mvc, vale, tokyo);
        TestExpenses.createEqual(mvc, vale, roma, "Cena", "80.00", pRoma, pRoma);
        TestExpenses.createEqual(mvc, vale, tokyo, "Ryokan", "30000.00", pTokyo, pTokyo);
        mvc.perform(get("/api/me/stats").header("Authorization", "Bearer " + vale))
                .andExpect(jsonPath("$.spending", hasSize(2)))
                .andExpect(jsonPath("$.spending[0].currency").value("EUR"))
                .andExpect(jsonPath("$.spending[0].groupTotal").value(80.00))
                .andExpect(jsonPath("$.spending[1].currency").value("JPY"))
                .andExpect(jsonPath("$.spending[1].groupTotal").value(30000.00))
                .andExpect(jsonPath("$.spending[1].myShare").value(30000.00));
    }

    @Test
    void ilTemaSiSalvaSoloSeInLista() throws Exception {
        String vale = TestUsers.register(mvc, "Vale");
        mvc.perform(get("/api/me").header("Authorization", "Bearer " + vale)).andExpect(jsonPath("$.theme").value("SYSTEM"));
        mvc.perform(patch("/api/me/preferences").header("Authorization", "Bearer " + vale).contentType(APPLICATION_JSON).content("{\"theme\":\"DARK\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.theme").value("DARK"));
        mvc.perform(patch("/api/me/preferences").header("Authorization", "Bearer " + vale).contentType(APPLICATION_JSON).content("{\"theme\":\"neon\"}"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.errors[0].field").value("theme"));
    }
}
