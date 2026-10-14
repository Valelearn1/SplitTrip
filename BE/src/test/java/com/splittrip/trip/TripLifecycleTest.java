package com.splittrip.trip;

import com.splittrip.IntegrationTest;
import com.splittrip.TestExpenses;
import com.splittrip.TestTrips;
import com.splittrip.TestUsers;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
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

    @Test
    void rivendicareUnPostoSenzaAccount() throws Exception {
        String vale = TestUsers.register(mvc, "Vale");
        String pina = TestUsers.register(mvc, "Giuseppina");
        UUID tripId = TestTrips.create(mvc, vale, "Roma");
        String code = TestTrips.inviteCode(mvc, vale, tripId);
        String created = mvc.perform(post("/api/trips/" + tripId + "/participants").header("Authorization", "Bearer " + vale)
                .contentType(APPLICATION_JSON).content("{\"displayName\":\"Nonna Pina\"}"))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        UUID pinaP = UUID.fromString(TestUsers.extract(created, "\"id\":\"([^\"]+)\""));
        UUID valeP = TestTrips.participantOf(mvc, vale, tripId);
        TestExpenses.createEqual(mvc, vale, tripId, "Gelato", "10.00", valeP, pinaP);

        mvc.perform(get("/api/trips/join-preview").param("code", code).header("Authorization", "Bearer " + pina))
                .andExpect(jsonPath("$.unclaimed", hasSize(1)))
                .andExpect(jsonPath("$.unclaimed[0].id").value(pinaP.toString()))
                .andExpect(jsonPath("$.unclaimed[0].displayName").value("Nonna Pina"));

        mvc.perform(post("/api/trips/join").header("Authorization", "Bearer " + pina)
                .contentType(APPLICATION_JSON).content("{\"code\":\"" + code + "\",\"participantId\":\"" + pinaP + "\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.participants", hasSize(2)))
                .andExpect(jsonPath("$.participants[?(@.id=='" + pinaP + "')].displayName").value("Nonna Pina"));
        // ritrova i suoi soldi
        mvc.perform(get("/api/trips/" + tripId + "/balances").header("Authorization", "Bearer " + pina))
                .andExpect(jsonPath("$.balances[?(@.participantId=='" + pinaP + "')].net").value(-10.00));
        // il posto non è più libero
        String other = TestUsers.register(mvc, "Altro");
        mvc.perform(post("/api/trips/join").header("Authorization", "Bearer " + other)
                .contentType(APPLICATION_JSON).content("{\"code\":\"" + code + "\",\"participantId\":\"" + pinaP + "\"}"))
                .andExpect(status().isConflict());
    }

    @Test
    void nonSiRivendicaUnPostoDiUnAltroViaggio() throws Exception {
        String vale = TestUsers.register(mvc, "Vale");
        String marco = TestUsers.register(mvc, "Marco");
        UUID roma = TestTrips.create(mvc, vale, "Roma");
        UUID parigi = TestTrips.create(mvc, vale, "Parigi");
        String created = mvc.perform(post("/api/trips/" + parigi + "/participants").header("Authorization", "Bearer " + vale)
                .contentType(APPLICATION_JSON).content("{\"displayName\":\"Ospite\"}"))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        UUID ospiteP = UUID.fromString(TestUsers.extract(created, "\"id\":\"([^\"]+)\""));
        mvc.perform(post("/api/trips/join").header("Authorization", "Bearer " + marco)
                .contentType(APPLICATION_JSON).content("{\"code\":\"" + TestTrips.inviteCode(mvc, vale, roma) + "\",\"participantId\":\"" + ospiteP + "\"}"))
                .andExpect(status().isNotFound());
        mvc.perform(get("/api/trips/" + parigi).header("Authorization", "Bearer " + marco)).andExpect(status().isForbidden());
    }

    @Test
    void chiRientraRitrovaLaSuaRiga() throws Exception {
        String vale = TestUsers.register(mvc, "Vale");
        String marco = TestUsers.register(mvc, "Marco");
        UUID tripId = TestTrips.create(mvc, vale, "Roma");
        String code = TestTrips.inviteCode(mvc, vale, tripId);
        TestTrips.join(mvc, marco, code);
        UUID marcoP = TestTrips.participantOf(mvc, marco, tripId);
        mvc.perform(delete("/api/trips/" + tripId + "/participants/" + marcoP).header("Authorization", "Bearer " + marco))
                .andExpect(status().isNoContent());
        TestTrips.join(mvc, marco, code);
        assertThat(TestTrips.participantOf(mvc, marco, tripId)).isEqualTo(marcoP);
    }

    @Test
    void viaggioInPianificazioneConUnaSpesaNelCestinoSiCancella() throws Exception {
        String vale = TestUsers.register(mvc, "Vale");
        String marco = TestUsers.register(mvc, "Marco");
        UUID tripId = TestTrips.create(mvc, vale, "Roma");
        TestTrips.join(mvc, marco, TestTrips.inviteCode(mvc, vale, tripId));
        UUID valeP = TestTrips.participantOf(mvc, vale, tripId);
        UUID marcoP = TestTrips.participantOf(mvc, marco, tripId);
        UUID expenseId = TestExpenses.createEqual(mvc, vale, tripId, "Cena", "20.00", valeP, valeP, marcoP);
        mvc.perform(delete("/api/trips/" + tripId + "/expenses/" + expenseId).header("Authorization", "Bearer " + vale))
                .andExpect(status().isNoContent());
        mvc.perform(delete("/api/trips/" + tripId).header("Authorization", "Bearer " + vale))
                .andExpect(status().isNoContent());
    }
}
