package com.splittrip.expense;

import com.splittrip.IntegrationTest;
import com.splittrip.TestExpenses;
import com.splittrip.TestTrips;
import com.splittrip.TestUsers;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.UUID;

import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class ExpenseControllerTest extends IntegrationTest {

    String vale, marco, giulia;
    UUID tripId, valeP, marcoP, giuliaP;

    @BeforeEach
    void setUp() throws Exception {
        vale = TestUsers.register(mvc, "Vale");
        marco = TestUsers.register(mvc, "Marco");
        giulia = TestUsers.register(mvc, "Giulia");
        tripId = TestTrips.create(mvc, vale, "Roma");
        String code = TestTrips.inviteCode(mvc, vale, tripId);
        TestTrips.join(mvc, marco, code);
        TestTrips.join(mvc, giulia, code);
        valeP = TestTrips.participantOf(mvc, vale, tripId);
        marcoP = TestTrips.participantOf(mvc, marco, tripId);
        giuliaP = TestTrips.participantOf(mvc, giulia, tripId);
    }

    @Test
    void divisioneEquaSalvaLeQuoteConIlResto() throws Exception {
        mvc.perform(post("/api/trips/" + tripId + "/expenses").header("Authorization", "Bearer " + marco)
                .contentType(APPLICATION_JSON).content(TestExpenses.equalBody("Cena", "100.00", marcoP, valeP, marcoP, giuliaP)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.payerId").value(marcoP.toString()))
                .andExpect(jsonPath("$.createdBy").value(TestUsers.idOf(mvc, marco).toString()))
                .andExpect(jsonPath("$.splitType").value("EQUAL"))
                .andExpect(jsonPath("$.shares", hasSize(3)))
                .andExpect(jsonPath("$.shares[*].amount", containsInAnyOrder(33.34, 33.33, 33.33)));
    }

    @Test
    void quotePersonalizzateCheNonTornanoDanno400() throws Exception {
        mvc.perform(post("/api/trips/" + tripId + "/expenses").header("Authorization", "Bearer " + vale)
                .contentType(APPLICATION_JSON).content("""
                {"description":"Taxi","amount":30.00,"date":"2026-11-02","category":"TRANSPORT","payerId":"%s",
                 "splitType":"CUSTOM","shares":[{"participantId":"%s","amount":10.00},{"participantId":"%s","amount":15.00}]}
                """.formatted(valeP, valeP, marcoP)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value(containsString("25.00")))
                .andExpect(jsonPath("$.detail").value(containsString("30.00")));
    }

    @Test
    void descrizioneDiSoliSpaziDa400SulCampo() throws Exception {
        mvc.perform(post("/api/trips/" + tripId + "/expenses").header("Authorization", "Bearer " + vale)
                .contentType(APPLICATION_JSON).content(TestExpenses.equalBody("   ", "10.00", valeP, valeP)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors[0].field").value("description"));
    }

    @Test
    void quotaConTreDecimaliDa400() throws Exception {
        mvc.perform(post("/api/trips/" + tripId + "/expenses").header("Authorization", "Bearer " + vale)
                .contentType(APPLICATION_JSON).content("""
                {"description":"Gelato","amount":10.00,"date":"2026-11-02","category":"FOOD","payerId":"%s",
                 "splitType":"CUSTOM","shares":[{"participantId":"%s","amount":10.005}]}
                """.formatted(valeP, valeP)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors[0].field").value(containsString("amount")));
    }

    @Test
    void partecipanteNonMembroDa400() throws Exception {
        mvc.perform(post("/api/trips/" + tripId + "/expenses").header("Authorization", "Bearer " + vale)
                .contentType(APPLICATION_JSON).content(TestExpenses.equalBody("Cena", "10.00", valeP, UUID.randomUUID())))
                .andExpect(status().isBadRequest());
    }

    @Test
    void modificaECancellazioneSoloAutoreOOrganizzatore() throws Exception {
        UUID expenseId = TestExpenses.createEqual(mvc, marco, tripId, "Cena", "90.00", marcoP, valeP, marcoP, giuliaP);
        String update = TestExpenses.equalBody("Cena rivista", "60.00", marcoP, valeP, marcoP);

        mvc.perform(put("/api/trips/" + tripId + "/expenses/" + expenseId).header("Authorization", "Bearer " + giulia)
                .contentType(APPLICATION_JSON).content(update)).andExpect(status().isForbidden());
        mvc.perform(put("/api/trips/" + tripId + "/expenses/" + expenseId).header("Authorization", "Bearer " + vale)
                .contentType(APPLICATION_JSON).content(update))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.description").value("Cena rivista"))
                .andExpect(jsonPath("$.shares", hasSize(2)));
        mvc.perform(delete("/api/trips/" + tripId + "/expenses/" + expenseId).header("Authorization", "Bearer " + giulia))
                .andExpect(status().isForbidden());
        mvc.perform(delete("/api/trips/" + tripId + "/expenses/" + expenseId).header("Authorization", "Bearer " + marco))
                .andExpect(status().isNoContent());
    }

    @Test
    void cestinoERipristino() throws Exception {
        UUID expenseId = TestExpenses.createEqual(mvc, vale, tripId, "Cena", "90.00", valeP, valeP, marcoP);
        mvc.perform(delete("/api/trips/" + tripId + "/expenses/" + expenseId).header("Authorization", "Bearer " + vale))
                .andExpect(status().isNoContent());
        mvc.perform(get("/api/trips/" + tripId + "/expenses").header("Authorization", "Bearer " + vale))
                .andExpect(jsonPath("$", hasSize(0)));
        mvc.perform(get("/api/trips/" + tripId + "/expenses/trash").header("Authorization", "Bearer " + marco))
                .andExpect(status().isForbidden());
        mvc.perform(get("/api/trips/" + tripId + "/expenses/trash").header("Authorization", "Bearer " + vale))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(expenseId.toString()))
                .andExpect(jsonPath("$[0].deletedAt").isNotEmpty());
        mvc.perform(post("/api/trips/" + tripId + "/expenses/" + expenseId + "/restore").header("Authorization", "Bearer " + vale))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.shares", hasSize(2)));
        mvc.perform(get("/api/trips/" + tripId + "/expenses").header("Authorization", "Bearer " + vale))
                .andExpect(jsonPath("$", hasSize(1)));
    }

    @Test
    void ripristinoBloccatoSeUnCoinvoltoHaLasciatoIlViaggio() throws Exception {
        UUID expenseId = TestExpenses.createEqual(mvc, vale, tripId, "Cena", "90.00", valeP, valeP, marcoP);
        mvc.perform(delete("/api/trips/" + tripId + "/expenses/" + expenseId).header("Authorization", "Bearer " + vale))
                .andExpect(status().isNoContent());
        mvc.perform(delete("/api/trips/" + tripId + "/participants/" + marcoP).header("Authorization", "Bearer " + marco))
                .andExpect(status().isNoContent());
        mvc.perform(post("/api/trips/" + tripId + "/expenses/" + expenseId + "/restore").header("Authorization", "Bearer " + vale))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.detail").value(containsString("Marco")));
    }

    @Test
    void ripristinoBloccatoSeChiHaPagatoHaLasciatoIlViaggio() throws Exception {
        UUID expenseId = TestExpenses.createEqual(mvc, giulia, tripId, "Taxi", "20.00", giuliaP, valeP, marcoP);
        mvc.perform(delete("/api/trips/" + tripId + "/expenses/" + expenseId).header("Authorization", "Bearer " + giulia))
                .andExpect(status().isNoContent());
        mvc.perform(delete("/api/trips/" + tripId + "/participants/" + giuliaP).header("Authorization", "Bearer " + giulia))
                .andExpect(status().isNoContent());
        mvc.perform(post("/api/trips/" + tripId + "/expenses/" + expenseId + "/restore").header("Authorization", "Bearer " + vale))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.detail").value(containsString("Giulia")));
    }

    @Test
    void conRimborsiAttiviNonSiRimuoveIlMembro() throws Exception {
        mvc.perform(post("/api/trips/" + tripId + "/settlements").header("Authorization", "Bearer " + marco)
                .contentType(APPLICATION_JSON).content("""
                {"fromParticipantId":"%s","toParticipantId":"%s","amount":35.00,"date":"2026-11-04"}
                """.formatted(marcoP, valeP)))
                .andExpect(status().isCreated());
        mvc.perform(delete("/api/trips/" + tripId + "/participants/" + marcoP).header("Authorization", "Bearer " + marco))
                .andExpect(status().isConflict());
    }

    @Test
    void divisionePerPesoConLaCoppiaCheContaPerDue() throws Exception {
        mvc.perform(post("/api/trips/" + tripId + "/expenses").header("Authorization", "Bearer " + vale)
                .contentType(APPLICATION_JSON).content("""
                {"description":"Cena","amount":100.00,"date":"2026-11-02","category":"FOOD","payerId":"%s",
                 "splitType":"WEIGHT","shares":[{"participantId":"%s","weight":2},{"participantId":"%s","weight":1},{"participantId":"%s","weight":1}]}
                """.formatted(valeP, valeP, marcoP, giuliaP)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.splitType").value("WEIGHT"))
                .andExpect(jsonPath("$.shares[?(@.participantId=='" + valeP + "')].amount").value(50.00))
                .andExpect(jsonPath("$.shares[?(@.participantId=='" + valeP + "')].weight").value(2.00))
                .andExpect(jsonPath("$.shares[?(@.participantId=='" + marcoP + "')].amount").value(25.00));
    }

    @Test
    void divisionePerPresenzaSalvaNottiEBase() throws Exception {
        mvc.perform(post("/api/trips/" + tripId + "/expenses").header("Authorization", "Bearer " + vale)
                .contentType(APPLICATION_JSON).content("""
                {"description":"Casa","amount":500.00,"date":"2026-11-01","category":"LODGING","payerId":"%s",
                 "splitType":"DAYS","dayBasis":"NIGHTS","shares":[{"participantId":"%s","weight":5},{"participantId":"%s","weight":5},{"participantId":"%s","weight":3}]}
                """.formatted(valeP, valeP, marcoP, giuliaP)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.dayBasis").value("NIGHTS"))
                .andExpect(jsonPath("$.shares[?(@.participantId=='" + giuliaP + "')].amount").value(115.38))
                .andExpect(jsonPath("$.shares[?(@.participantId=='" + giuliaP + "')].weight").value(3.00))
                .andExpect(jsonPath("$.shares[?(@.participantId=='" + valeP + "')].amount").value(192.31));
    }

    @Test
    void presenzaSenzaBaseEPesoMancanteDanno400() throws Exception {
        mvc.perform(post("/api/trips/" + tripId + "/expenses").header("Authorization", "Bearer " + vale)
                .contentType(APPLICATION_JSON).content("""
                {"description":"Casa","amount":100.00,"date":"2026-11-01","category":"LODGING","payerId":"%s",
                 "splitType":"DAYS","shares":[{"participantId":"%s","weight":2}]}
                """.formatted(valeP, valeP)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors[0].field").value("dayBasis"));
        mvc.perform(post("/api/trips/" + tripId + "/expenses").header("Authorization", "Bearer " + vale)
                .contentType(APPLICATION_JSON).content("""
                {"description":"Cena","amount":100.00,"date":"2026-11-02","category":"FOOD","payerId":"%s",
                 "splitType":"WEIGHT","shares":[{"participantId":"%s","weight":2},{"participantId":"%s"}]}
                """.formatted(valeP, valeP, marcoP)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors[0].field").value(containsString("weight")));
    }

    @Test
    void pesoEnormeOConTreDecimaliDa400() throws Exception {
        for (String weight : List.of("1000000", "1.005")) {
            mvc.perform(post("/api/trips/" + tripId + "/expenses").header("Authorization", "Bearer " + vale)
                    .contentType(APPLICATION_JSON).content("""
                    {"description":"Cena","amount":100.00,"date":"2026-11-02","category":"FOOD","payerId":"%s",
                     "splitType":"WEIGHT","shares":[{"participantId":"%s","weight":%s}]}
                    """.formatted(valeP, valeP, weight)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.errors[0].field").value(containsString("weight")));
        }
    }

    @Test
    void tuttiAZeroNottiDa400() throws Exception {
        mvc.perform(post("/api/trips/" + tripId + "/expenses").header("Authorization", "Bearer " + vale)
                .contentType(APPLICATION_JSON).content("""
                {"description":"Casa","amount":100.00,"date":"2026-11-01","category":"LODGING","payerId":"%s",
                 "splitType":"DAYS","dayBasis":"NIGHTS","shares":[{"participantId":"%s","weight":0},{"participantId":"%s","weight":0}]}
                """.formatted(valeP, valeP, marcoP)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value(containsString("maggiore di zero")));
    }

    @Test
    void modificaDiUnaSpesaPerPesoSovrascriveIPesi() throws Exception {
        String created = mvc.perform(post("/api/trips/" + tripId + "/expenses").header("Authorization", "Bearer " + vale)
                .contentType(APPLICATION_JSON).content("""
                {"description":"Cena","amount":100.00,"date":"2026-11-02","category":"FOOD","payerId":"%s",
                 "splitType":"WEIGHT","shares":[{"participantId":"%s","weight":2},{"participantId":"%s","weight":1}]}
                """.formatted(valeP, valeP, marcoP))).andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        UUID id = UUID.fromString(TestUsers.extract(created, "\"id\":\"([^\"]+)\""));
        mvc.perform(put("/api/trips/" + tripId + "/expenses/" + id).header("Authorization", "Bearer " + vale)
                .contentType(APPLICATION_JSON).content("""
                {"description":"Cena","amount":100.00,"date":"2026-11-02","category":"FOOD","payerId":"%s",
                 "splitType":"WEIGHT","shares":[{"participantId":"%s","weight":1},{"participantId":"%s","weight":3}]}
                """.formatted(valeP, valeP, marcoP)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.shares[?(@.participantId=='" + marcoP + "')].amount").value(75.00))
                .andExpect(jsonPath("$.shares[?(@.participantId=='" + marcoP + "')].weight").value(3.00));
    }

    @Test
    void viaggioChiusoRifiutaLeScritture() throws Exception {
        mvc.perform(patch("/api/trips/" + tripId).header("Authorization", "Bearer " + vale)
                .contentType(APPLICATION_JSON).content("{\"status\":\"CLOSED\"}")).andExpect(status().isOk());
        mvc.perform(post("/api/trips/" + tripId + "/expenses").header("Authorization", "Bearer " + vale)
                .contentType(APPLICATION_JSON).content(TestExpenses.equalBody("Cena", "10.00", valeP, valeP)))
                .andExpect(status().isConflict());
    }

    @Test
    void conSpeseAttiveNonSiCancellaIlViaggioNeSiRimuoveIlMembro() throws Exception {
        TestExpenses.createEqual(mvc, vale, tripId, "Cena", "90.00", valeP, valeP, marcoP);
        mvc.perform(delete("/api/trips/" + tripId).header("Authorization", "Bearer " + vale))
                .andExpect(status().isConflict());
        mvc.perform(delete("/api/trips/" + tripId + "/participants/" + marcoP).header("Authorization", "Bearer " + vale))
                .andExpect(status().isConflict());
    }

    @Test
    void filtroPerCategoriaEOrdinePerData() throws Exception {
        TestExpenses.createEqual(mvc, vale, tripId, "Cena", "10.00", valeP, valeP);
        mvc.perform(post("/api/trips/" + tripId + "/expenses").header("Authorization", "Bearer " + vale)
                .contentType(APPLICATION_JSON).content("""
                {"description":"Treno","amount":20.00,"date":"2026-11-03","category":"TRANSPORT","payerId":"%s",
                 "splitType":"EQUAL","shares":[{"participantId":"%s"}]}
                """.formatted(valeP, valeP))).andExpect(status().isCreated());

        mvc.perform(get("/api/trips/" + tripId + "/expenses").header("Authorization", "Bearer " + vale))
                .andExpect(jsonPath("$[0].description").value("Treno"))
                .andExpect(jsonPath("$[1].description").value("Cena"));
        mvc.perform(get("/api/trips/" + tripId + "/expenses").param("category", "FOOD").header("Authorization", "Bearer " + vale))
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].description").value("Cena"));
    }
}
