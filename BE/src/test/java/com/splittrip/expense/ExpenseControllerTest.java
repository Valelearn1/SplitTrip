package com.splittrip.expense;

import com.splittrip.IntegrationTest;
import com.splittrip.TestExpenses;
import com.splittrip.TestTrips;
import com.splittrip.TestUsers;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

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
    UUID valeId, marcoId, giuliaId, tripId;

    @BeforeEach
    void setUp() throws Exception {
        vale = TestUsers.register(mvc, "Vale");
        marco = TestUsers.register(mvc, "Marco");
        giulia = TestUsers.register(mvc, "Giulia");
        valeId = TestUsers.idOf(mvc, vale);
        marcoId = TestUsers.idOf(mvc, marco);
        giuliaId = TestUsers.idOf(mvc, giulia);
        tripId = TestTrips.create(mvc, vale, "Roma");
        String code = TestTrips.inviteCode(mvc, vale, tripId);
        TestTrips.join(mvc, marco, code);
        TestTrips.join(mvc, giulia, code);
    }

    @Test
    void divisioneEquaSalvaLeQuoteConIlResto() throws Exception {
        mvc.perform(post("/api/trips/" + tripId + "/expenses").header("Authorization", "Bearer " + marco)
                .contentType(APPLICATION_JSON).content(TestExpenses.equalBody("Cena", "100.00", marcoId, valeId, marcoId, giuliaId)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.payerId").value(marcoId.toString()))
                .andExpect(jsonPath("$.createdBy").value(marcoId.toString()))
                .andExpect(jsonPath("$.splitType").value("EQUAL"))
                .andExpect(jsonPath("$.shares", hasSize(3)))
                .andExpect(jsonPath("$.shares[*].amount", containsInAnyOrder(33.34, 33.33, 33.33)));
    }

    @Test
    void quotePersonalizzateCheNonTornanoDanno400() throws Exception {
        mvc.perform(post("/api/trips/" + tripId + "/expenses").header("Authorization", "Bearer " + vale)
                .contentType(APPLICATION_JSON).content("""
                {"description":"Taxi","amount":30.00,"date":"2026-11-02","category":"TRANSPORT","payerId":"%s",
                 "splitType":"CUSTOM","shares":[{"userId":"%s","amount":10.00},{"userId":"%s","amount":15.00}]}
                """.formatted(valeId, valeId, marcoId)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value(containsString("25.00")))
                .andExpect(jsonPath("$.detail").value(containsString("30.00")));
    }

    @Test
    void descrizioneDiSoliSpaziDa400SulCampo() throws Exception {
        mvc.perform(post("/api/trips/" + tripId + "/expenses").header("Authorization", "Bearer " + vale)
                .contentType(APPLICATION_JSON).content(TestExpenses.equalBody("   ", "10.00", valeId, valeId)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors[0].field").value("description"));
    }

    @Test
    void quotaConTreDecimaliDa400() throws Exception {
        mvc.perform(post("/api/trips/" + tripId + "/expenses").header("Authorization", "Bearer " + vale)
                .contentType(APPLICATION_JSON).content("""
                {"description":"Gelato","amount":10.00,"date":"2026-11-02","category":"FOOD","payerId":"%s",
                 "splitType":"CUSTOM","shares":[{"userId":"%s","amount":10.005}]}
                """.formatted(valeId, valeId)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors[0].field").value(containsString("amount")));
    }

    @Test
    void partecipanteNonMembroDa400() throws Exception {
        mvc.perform(post("/api/trips/" + tripId + "/expenses").header("Authorization", "Bearer " + vale)
                .contentType(APPLICATION_JSON).content(TestExpenses.equalBody("Cena", "10.00", valeId, UUID.randomUUID())))
                .andExpect(status().isBadRequest());
    }

    @Test
    void modificaECancellazioneSoloAutoreOOrganizzatore() throws Exception {
        UUID expenseId = TestExpenses.createEqual(mvc, marco, tripId, "Cena", "90.00", marcoId, valeId, marcoId, giuliaId);
        String update = TestExpenses.equalBody("Cena rivista", "60.00", marcoId, valeId, marcoId);

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
        UUID expenseId = TestExpenses.createEqual(mvc, vale, tripId, "Cena", "90.00", valeId, valeId, marcoId);
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
        UUID expenseId = TestExpenses.createEqual(mvc, vale, tripId, "Cena", "90.00", valeId, valeId, marcoId);
        mvc.perform(delete("/api/trips/" + tripId + "/expenses/" + expenseId).header("Authorization", "Bearer " + vale))
                .andExpect(status().isNoContent());
        mvc.perform(delete("/api/trips/" + tripId + "/members/" + marcoId).header("Authorization", "Bearer " + marco))
                .andExpect(status().isNoContent());
        mvc.perform(post("/api/trips/" + tripId + "/expenses/" + expenseId + "/restore").header("Authorization", "Bearer " + vale))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.detail").value(containsString("Marco")));
    }

    @Test
    void ripristinoBloccatoSeChiHaPagatoHaLasciatoIlViaggio() throws Exception {
        UUID expenseId = TestExpenses.createEqual(mvc, giulia, tripId, "Taxi", "20.00", giuliaId, valeId, marcoId);
        mvc.perform(delete("/api/trips/" + tripId + "/expenses/" + expenseId).header("Authorization", "Bearer " + giulia))
                .andExpect(status().isNoContent());
        mvc.perform(delete("/api/trips/" + tripId + "/members/" + giuliaId).header("Authorization", "Bearer " + giulia))
                .andExpect(status().isNoContent());
        mvc.perform(post("/api/trips/" + tripId + "/expenses/" + expenseId + "/restore").header("Authorization", "Bearer " + vale))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.detail").value(containsString("Giulia")));
    }

    @Test
    void conRimborsiAttiviNonSiRimuoveIlMembro() throws Exception {
        mvc.perform(post("/api/trips/" + tripId + "/settlements").header("Authorization", "Bearer " + marco)
                .contentType(APPLICATION_JSON).content("""
                {"fromUserId":"%s","toUserId":"%s","amount":35.00,"date":"2026-11-04"}
                """.formatted(marcoId, valeId)))
                .andExpect(status().isCreated());
        mvc.perform(delete("/api/trips/" + tripId + "/members/" + marcoId).header("Authorization", "Bearer " + marco))
                .andExpect(status().isConflict());
    }

    @Test
    void viaggioChiusoRifiutaLeScritture() throws Exception {
        mvc.perform(patch("/api/trips/" + tripId).header("Authorization", "Bearer " + vale)
                .contentType(APPLICATION_JSON).content("{\"status\":\"CLOSED\"}")).andExpect(status().isOk());
        mvc.perform(post("/api/trips/" + tripId + "/expenses").header("Authorization", "Bearer " + vale)
                .contentType(APPLICATION_JSON).content(TestExpenses.equalBody("Cena", "10.00", valeId, valeId)))
                .andExpect(status().isConflict());
    }

    @Test
    void conSpeseAttiveNonSiCancellaIlViaggioNeSiRimuoveIlMembro() throws Exception {
        TestExpenses.createEqual(mvc, vale, tripId, "Cena", "90.00", valeId, valeId, marcoId);
        mvc.perform(delete("/api/trips/" + tripId).header("Authorization", "Bearer " + vale))
                .andExpect(status().isConflict());
        mvc.perform(delete("/api/trips/" + tripId + "/members/" + marcoId).header("Authorization", "Bearer " + vale))
                .andExpect(status().isConflict());
    }

    @Test
    void filtroPerCategoriaEOrdinePerData() throws Exception {
        TestExpenses.createEqual(mvc, vale, tripId, "Cena", "10.00", valeId, valeId);
        mvc.perform(post("/api/trips/" + tripId + "/expenses").header("Authorization", "Bearer " + vale)
                .contentType(APPLICATION_JSON).content("""
                {"description":"Treno","amount":20.00,"date":"2026-11-03","category":"TRANSPORT","payerId":"%s",
                 "splitType":"EQUAL","shares":[{"userId":"%s"}]}
                """.formatted(valeId, valeId))).andExpect(status().isCreated());

        mvc.perform(get("/api/trips/" + tripId + "/expenses").header("Authorization", "Bearer " + vale))
                .andExpect(jsonPath("$[0].description").value("Treno"))
                .andExpect(jsonPath("$[1].description").value("Cena"));
        mvc.perform(get("/api/trips/" + tripId + "/expenses").param("category", "FOOD").header("Authorization", "Bearer " + vale))
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].description").value("Cena"));
    }
}
