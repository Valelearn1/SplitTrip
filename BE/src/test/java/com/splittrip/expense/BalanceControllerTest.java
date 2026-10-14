package com.splittrip.expense;

import com.splittrip.IntegrationTest;
import com.splittrip.TestExpenses;
import com.splittrip.TestTrips;
import com.splittrip.TestUsers;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class BalanceControllerTest extends IntegrationTest {

    @Test
    void saldiERiepilogoDellEsempioDiRiferimento() throws Exception {
        String marco = TestUsers.register(mvc, "Marco");
        String giulia = TestUsers.register(mvc, "Giulia");
        String vale = TestUsers.register(mvc, "Vale");
        UUID tripId = TestTrips.create(mvc, marco, "Roma");
        String code = TestTrips.inviteCode(mvc, marco, tripId);
        TestTrips.join(mvc, giulia, code);
        TestTrips.join(mvc, vale, code);
        UUID marcoId = TestTrips.participantOf(mvc, marco, tripId);
        UUID giuliaId = TestTrips.participantOf(mvc, giulia, tripId);
        UUID valeId = TestTrips.participantOf(mvc, vale, tripId);

        TestExpenses.createEqual(mvc, marco, tripId, "Cena", "90.00", marcoId, marcoId, giuliaId, valeId);
        mvc.perform(post("/api/trips/" + tripId + "/expenses").header("Authorization", "Bearer " + giulia)
                .contentType(APPLICATION_JSON).content("""
                {"description":"Taxi","amount":30.00,"date":"2026-11-02","category":"TRANSPORT","payerId":"%s",
                 "splitType":"EQUAL","shares":[{"participantId":"%s"},{"participantId":"%s"}]}
                """.formatted(giuliaId, giuliaId, valeId))).andExpect(status().isCreated());
        mvc.perform(post("/api/trips/" + tripId + "/settlements").header("Authorization", "Bearer " + vale)
                .contentType(APPLICATION_JSON).content("""
                {"fromParticipantId":"%s","toParticipantId":"%s","amount":10.00,"date":"2026-11-03"}
                """.formatted(valeId, marcoId))).andExpect(status().isCreated());

        mvc.perform(get("/api/trips/" + tripId + "/balances").header("Authorization", "Bearer " + vale))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.balances", hasSize(3)))
                .andExpect(jsonPath("$.balances[?(@.displayName=='Marco')].net").value(50.00))
                .andExpect(jsonPath("$.balances[?(@.displayName=='Giulia')].net").value(-15.00))
                .andExpect(jsonPath("$.balances[?(@.displayName=='Vale')].net").value(-35.00))
                .andExpect(jsonPath("$.suggestedTransfers", hasSize(2)))
                .andExpect(jsonPath("$.suggestedTransfers[0].fromName").value("Vale"))
                .andExpect(jsonPath("$.suggestedTransfers[0].toName").value("Marco"))
                .andExpect(jsonPath("$.suggestedTransfers[0].amount").value(35.00));

        mvc.perform(get("/api/trips/" + tripId + "/summary").header("Authorization", "Bearer " + vale))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(120.00))
                .andExpect(jsonPath("$.byCategory.FOOD").value(90.00))
                .andExpect(jsonPath("$.byCategory.TRANSPORT").value(30.00))
                .andExpect(jsonPath("$.byPayer[?(@.displayName=='Marco')].amount").value(90.00));
    }

    @Test
    void viaggioVuotoHaSaldiAZero() throws Exception {
        String vale = TestUsers.register(mvc, "Vale");
        UUID tripId = TestTrips.create(mvc, vale, "Roma");
        mvc.perform(get("/api/trips/" + tripId + "/balances").header("Authorization", "Bearer " + vale))
                .andExpect(jsonPath("$.balances", hasSize(1)))
                .andExpect(jsonPath("$.balances[0].net").value(0))
                .andExpect(jsonPath("$.suggestedTransfers", hasSize(0)));
    }
}
