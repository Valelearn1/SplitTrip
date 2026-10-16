package com.splittrip.expense;

import com.splittrip.IntegrationTest;
import com.splittrip.TestExpenses;
import com.splittrip.TestTrips;
import com.splittrip.TestUsers;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.UUID;

import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Importi: al massimo 6 cifre intere e 2 decimali (999.999,99) su spese, quote, rimborsi e ipotesi. */
class AmountLimitsTest extends IntegrationTest {

    static final String TOO_MUCH = "Al massimo 999.999,99 (due decimali)";

    @Test
    void speseQuoteERimborsiFinoA999999e99() throws Exception {
        String vale = TestUsers.register(mvc, "Vale");
        UUID tripId = TestTrips.create(mvc, vale, "Roma");
        UUID valeP = TestTrips.participantOf(mvc, vale, tripId);
        String expenses = "/api/trips/" + tripId + "/expenses";

        mvc.perform(post(expenses).header("Authorization", "Bearer " + vale).contentType(APPLICATION_JSON)
                        .content(TestExpenses.equalBody("Villa", "1000000.00", valeP, valeP)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors[0].field").value("amount")).andExpect(jsonPath("$.errors[0].message").value(TOO_MUCH));
        mvc.perform(post(expenses).header("Authorization", "Bearer " + vale).contentType(APPLICATION_JSON)
                        .content(TestExpenses.equalBody("Villa", "999999.99", valeP, valeP)))
                .andExpect(status().isCreated());
        mvc.perform(post(expenses).header("Authorization", "Bearer " + vale).contentType(APPLICATION_JSON)
                        .content(TestExpenses.equalBody("Caffè", "0.01", valeP, valeP)))
                .andExpect(status().isCreated());
        mvc.perform(post(expenses).header("Authorization", "Bearer " + vale).contentType(APPLICATION_JSON).content("""
                {"description":"Su misura","amount":10.00,"date":"2026-11-02","category":"FOOD","payerId":"%s","splitType":"CUSTOM",
                 "shares":[{"participantId":"%s","amount":1000000.00}]}
                """.formatted(valeP, valeP)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors[0].field").value("shares[0].amount")).andExpect(jsonPath("$.errors[0].message").value(TOO_MUCH));

        mvc.perform(post("/api/trips/" + tripId + "/participants").header("Authorization", "Bearer " + vale).contentType(APPLICATION_JSON).content("{\"displayName\":\"Nonna Pina\"}"));
        UUID pina = UUID.fromString(TestUsers.extract(mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get("/api/trips/" + tripId)
                .header("Authorization", "Bearer " + vale)).andReturn().getResponse().getContentAsString(), "\"id\":\"([^\"]+)\",\"userId\":null"));
        mvc.perform(post("/api/trips/" + tripId + "/settlements").header("Authorization", "Bearer " + vale).contentType(APPLICATION_JSON).content("""
                {"fromParticipantId":"%s","toParticipantId":"%s","amount":1000000.00,"date":"2026-11-03"}
                """.formatted(pina, valeP)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors[0].field").value("amount")).andExpect(jsonPath("$.errors[0].message").value(TOO_MUCH));
    }

    @Test
    void ipotesiFinoA999999e99() throws Exception {
        String vale = TestUsers.register(mvc, "Vale");
        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        String body = mvc.perform(post("/api/trips").header("Authorization", "Bearer " + vale).contentType(APPLICATION_JSON).content("""
                {"name":"Finito","destination":"Roma","startDate":"%s","endDate":"%s","latitude":41.9,"longitude":12.5}
                """.formatted(today.minusDays(5), today.minusDays(2)))).andReturn().getResponse().getContentAsString();
        String guess = "/api/trips/" + TestUsers.extract(body, "\"id\":\"([^\"]+)\"") + "/wrapped/guess";
        mvc.perform(post(guess).header("Authorization", "Bearer " + vale).contentType(APPLICATION_JSON).content("{\"amount\":1000000.00}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors[0].field").value("amount")).andExpect(jsonPath("$.errors[0].message").value(TOO_MUCH));
        mvc.perform(post(guess).header("Authorization", "Bearer " + vale).contentType(APPLICATION_JSON).content("{\"amount\":999999.99}"))
                .andExpect(status().isNoContent());
    }
}
