package com.splittrip.expense;

import com.splittrip.IntegrationTest;
import com.splittrip.TestExpenses;
import com.splittrip.TestTrips;
import com.splittrip.TestUsers;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.hamcrest.Matchers.closeTo;
import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** D-69: lo scontrino in yen, il cambio salvato, i conti nella valuta del viaggio. */
class ForeignCurrencyExpenseTest extends IntegrationTest {

    String ada, bruno;
    UUID tripId, adaP, brunoP;

    @BeforeEach
    void setUp() throws Exception {
        ada = TestUsers.register(mvc, "Ada");
        bruno = TestUsers.register(mvc, "Bruno");
        tripId = TestTrips.create(mvc, ada, "Tokyo");                       // valuta del viaggio: EUR
        TestTrips.join(mvc, bruno, TestTrips.inviteCode(mvc, ada, tripId));
        adaP = TestTrips.participantOf(mvc, ada, tripId);
        brunoP = TestTrips.participantOf(mvc, bruno, tripId);
    }

    String yen(String amount, String fxRate, String splitType, String shares) {
        return """
                {"description":"Cena","amount":%s,"currency":"JPY","fxRate":%s,"date":"2026-11-02","category":"FOOD",
                 "payerId":"%s","splitType":"%s","shares":[%s]}
                """.formatted(amount, fxRate, adaP, splitType, shares);
    }

    @Test
    void spesaInYenConvertitaEDivisaNellaValutaDelViaggio() throws Exception {
        mvc.perform(post("/api/trips/" + tripId + "/expenses").header("Authorization", "Bearer " + ada).contentType(APPLICATION_JSON)
                        .content(yen("2000", "0.00562366", "EQUAL", "{\"participantId\":\"%s\"},{\"participantId\":\"%s\"}".formatted(adaP, brunoP))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.amount").value(2000))
                .andExpect(jsonPath("$.currency").value("JPY"))
                .andExpect(jsonPath("$.fxRate").value(0.00562366))
                .andExpect(jsonPath("$.amountBase").value(11.25))
                .andExpect(jsonPath("$.shares[*].amount", containsInAnyOrder(5.63, 5.62)));
        mvc.perform(get("/api/trips/" + tripId + "/balances").header("Authorization", "Bearer " + bruno))
                // il centesimo di resto va a una delle due persone: il saldo è ±5,62 o ±5,63 (il filtro jsonPath restituisce una lista)
                .andExpect(jsonPath("$.balances[?(@.displayName=='Bruno')].net", hasItem(closeTo(-5.625, 0.006))))
                .andExpect(jsonPath("$.balances[?(@.displayName=='Ada')].net", hasItem(closeTo(5.625, 0.006))));
        mvc.perform(get("/api/trips/" + tripId + "/summary").header("Authorization", "Bearer " + bruno))
                .andExpect(jsonPath("$.total").value(11.25))
                .andExpect(jsonPath("$.byCategory.FOOD").value(11.25));
    }

    @Test
    void quotePersonalizzateInYenSommanoAlCentesimoInEuro() throws Exception {
        mvc.perform(post("/api/trips/" + tripId + "/expenses").header("Authorization", "Bearer " + ada).contentType(APPLICATION_JSON)
                        .content(yen("2000", "0.00562366", "CUSTOM",
                                "{\"participantId\":\"%s\",\"amount\":1200},{\"participantId\":\"%s\",\"amount\":800}".formatted(adaP, brunoP))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.shares[?(@.participantId=='%s')].amount".formatted(adaP)).value(6.75))   // 11,25 × 1200/2000
                .andExpect(jsonPath("$.shares[?(@.participantId=='%s')].amount".formatted(brunoP)).value(4.50));
        mvc.perform(post("/api/trips/" + tripId + "/expenses").header("Authorization", "Bearer " + ada).contentType(APPLICATION_JSON)
                        .content(yen("2000", "0.00562366", "CUSTOM",
                                "{\"participantId\":\"%s\",\"amount\":1200},{\"participantId\":\"%s\",\"amount\":700}".formatted(adaP, brunoP))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("La somma delle quote (1900) non corrisponde al totale (2000)"));
    }

    @Test
    void controlliSulCambioESullaValuta() throws Exception {
        String two = "{\"participantId\":\"%s\"},{\"participantId\":\"%s\"}".formatted(adaP, brunoP);
        mvc.perform(post("/api/trips/" + tripId + "/expenses").header("Authorization", "Bearer " + ada).contentType(APPLICATION_JSON)
                        .content(yen("2000", "0", "EQUAL", two)))                                                    // Review Focus 1
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.errors[0].field").value("fxRate"));
        mvc.perform(post("/api/trips/" + tripId + "/expenses").header("Authorization", "Bearer " + ada).contentType(APPLICATION_JSON)
                        .content(yen("2000", "0.123456789", "EQUAL", two)))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.errors[0].field").value("fxRate"));
        mvc.perform(post("/api/trips/" + tripId + "/expenses").header("Authorization", "Bearer " + ada).contentType(APPLICATION_JSON)
                        .content(yen("2000", "null", "EQUAL", two)))                                                 // valuta diversa senza cambio
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.errors[0].field").value("fxRate"));
        mvc.perform(post("/api/trips/" + tripId + "/expenses").header("Authorization", "Bearer " + ada).contentType(APPLICATION_JSON)
                        .content(yen("2000.50", "0.00562366", "EQUAL", two)))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.errors[0].message").value("Lo yen giapponese non ha centesimi"));
        mvc.perform(post("/api/trips/" + tripId + "/expenses").header("Authorization", "Bearer " + ada).contentType(APPLICATION_JSON)
                        .content(yen("99999999", "0.5", "EQUAL", two)))                                             // Review Focus 2: convertito oltre il tetto
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.errors[0].field").value("amount"))
                .andExpect(jsonPath("$.errors[0].message").value("Al massimo 999.999,99 (due decimali)"));
    }

    @Test
    void stessaValutaDelViaggioComePrima() throws Exception {
        mvc.perform(post("/api/trips/" + tripId + "/expenses").header("Authorization", "Bearer " + ada).contentType(APPLICATION_JSON)
                        .content(TestExpenses.equalBody("Taxi", "30.00", adaP, adaP, brunoP)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.currency").value("EUR"))
                .andExpect(jsonPath("$.fxRate").value(1))
                .andExpect(jsonPath("$.amountBase").value(30.00));
    }

    @Test
    void modificaTieneIlCambioInviatoEAggiornaIlConvertito() throws Exception {
        String body = mvc.perform(post("/api/trips/" + tripId + "/expenses").header("Authorization", "Bearer " + ada).contentType(APPLICATION_JSON)
                        .content(yen("2000", "0.00562366", "EQUAL", "{\"participantId\":\"%s\"},{\"participantId\":\"%s\"}".formatted(adaP, brunoP))))
                .andReturn().getResponse().getContentAsString();
        String id = TestUsers.extract(body, "\"id\":\"([^\"]+)\"");
        mvc.perform(put("/api/trips/" + tripId + "/expenses/" + id).header("Authorization", "Bearer " + ada).contentType(APPLICATION_JSON)
                        .content(yen("3000", "0.00562366", "EQUAL", "{\"participantId\":\"%s\"},{\"participantId\":\"%s\"}".formatted(adaP, brunoP))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.amountBase").value(16.87))
                .andExpect(jsonPath("$.shares[*].amount", containsInAnyOrder(8.44, 8.43)));
    }
}
