package com.splittrip.expense;

import com.splittrip.IntegrationTest;
import com.splittrip.TestExpenses;
import com.splittrip.TestTrips;
import com.splittrip.TestUsers;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** D-69: «Salda» in yen contanti; il saldo si muove dell'importo convertito e un rimborso parziale lascia il resto. */
class ForeignCurrencySettlementTest extends IntegrationTest {

    @Test
    void rimborsoInYenConvertitoNeiSaldi() throws Exception {                                  // Review Focus 5
        String ada = TestUsers.register(mvc, "Ada"), bruno = TestUsers.register(mvc, "Bruno");
        UUID tripId = TestTrips.create(mvc, ada, "Tokyo");
        TestTrips.join(mvc, bruno, TestTrips.inviteCode(mvc, ada, tripId));
        UUID adaP = TestTrips.participantOf(mvc, ada, tripId), brunoP = TestTrips.participantOf(mvc, bruno, tripId);
        TestExpenses.createEqual(mvc, ada, tripId, "Cena", "60.00", adaP, adaP, brunoP);        // Bruno deve 30 €

        mvc.perform(post("/api/trips/" + tripId + "/settlements").header("Authorization", "Bearer " + bruno).contentType(APPLICATION_JSON).content("""
                {"fromParticipantId":"%s","toParticipantId":"%s","amount":5000,"currency":"JPY","fxRate":0.00562366,"date":"2026-11-03"}
                """.formatted(brunoP, adaP)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.amount").value(5000)).andExpect(jsonPath("$.currency").value("JPY"))
                .andExpect(jsonPath("$.amountBase").value(28.12));
        mvc.perform(get("/api/trips/" + tripId + "/balances").header("Authorization", "Bearer " + bruno))
                .andExpect(jsonPath("$.balances[?(@.displayName=='Bruno')].net").value(-1.88))
                .andExpect(jsonPath("$.suggestedTransfers[0].amount").value(1.88));

        mvc.perform(post("/api/trips/" + tripId + "/settlements").header("Authorization", "Bearer " + bruno).contentType(APPLICATION_JSON).content("""
                {"fromParticipantId":"%s","toParticipantId":"%s","amount":500.5,"currency":"JPY","fxRate":0.00562366,"date":"2026-11-03"}
                """.formatted(brunoP, adaP)))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.errors[0].message").value("Lo yen giapponese non ha centesimi"));
        mvc.perform(post("/api/trips/" + tripId + "/settlements").header("Authorization", "Bearer " + bruno).contentType(APPLICATION_JSON).content("""
                {"fromParticipantId":"%s","toParticipantId":"%s","amount":10.00,"date":"2026-11-03"}
                """.formatted(brunoP, adaP)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.currency").value("EUR")).andExpect(jsonPath("$.fxRate").value(1)).andExpect(jsonPath("$.amountBase").value(10.00));
    }
}
