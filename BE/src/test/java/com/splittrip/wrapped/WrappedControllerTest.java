package com.splittrip.wrapped;

import com.splittrip.IntegrationTest;
import com.splittrip.TestExpenses;
import com.splittrip.TestTrips;
import com.splittrip.TestUsers;
import com.splittrip.photo.PhotoControllerTest;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class WrappedControllerTest extends IntegrationTest {

    final LocalDate today = LocalDate.now(ZoneOffset.UTC);

    UUID createTrip(String token, LocalDate start, LocalDate end) throws Exception {
        String body = mvc.perform(post("/api/trips").header("Authorization", "Bearer " + token).contentType(APPLICATION_JSON).content("""
                {"name":"Lisbona 2026","destination":"Lisbona","startDate":"%s","endDate":"%s"}
                """.formatted(start, end))).andReturn().getResponse().getContentAsString();
        return UUID.fromString(TestUsers.extract(body, "\"id\":\"([^\"]+)\""));
    }

    @Test
    void numeriBadgeEIpotesiDiUnViaggioChiuso() throws Exception {
        String vale = TestUsers.register(mvc, "Vale");
        String marco = TestUsers.register(mvc, "Marco");
        UUID tripId = createTrip(vale, today.minusDays(6), today.minusDays(2));                  // 4 notti, finito
        TestTrips.join(mvc, marco, TestTrips.inviteCode(mvc, vale, tripId));
        UUID valeP = TestTrips.participantOf(mvc, vale, tripId), marcoP = TestTrips.participantOf(mvc, marco, tripId);
        mvc.perform(post("/api/trips/" + tripId + "/participants").header("Authorization", "Bearer " + vale).contentType(APPLICATION_JSON).content("{\"displayName\":\"Nonna Pina\"}"));
        TestExpenses.createEqual(mvc, vale, tripId, "Casa", "300.00", valeP, valeP, marcoP);        // FOOD, data fissa 2026-11-02 (TestExpenses.equalBody)
        mvc.perform(post("/api/trips/" + tripId + "/expenses").header("Authorization", "Bearer " + vale).contentType(APPLICATION_JSON).content("""
                {"description":"Appartamento","amount":200.00,"date":"%s","category":"LODGING","payerId":"%s","splitType":"EQUAL","shares":[{"participantId":"%s"},{"participantId":"%s"}]}
                """.formatted(today.minusDays(6), valeP, valeP, marcoP))).andExpect(status().isCreated());
        UUID trash = TestExpenses.createEqual(mvc, marco, tripId, "Sbagliata", "999.00", marcoP, valeP, marcoP);
        mvc.perform(delete("/api/trips/" + tripId + "/expenses/" + trash).header("Authorization", "Bearer " + marco)).andExpect(status().isNoContent());
        mvc.perform(post("/api/trips/" + tripId + "/settlements").header("Authorization", "Bearer " + marco).contentType(APPLICATION_JSON).content("""
                {"fromParticipantId":"%s","toParticipantId":"%s","amount":100.00,"date":"%s"}
                """.formatted(marcoP, valeP, today.minusDays(1)))).andExpect(status().isCreated());
        String m = mvc.perform(post("/api/trips/" + tripId + "/messages").header("Authorization", "Bearer " + marco).contentType(APPLICATION_JSON).content("{\"content\":\"Che viaggio!\"}"))
                .andReturn().getResponse().getContentAsString();
        String msgId = TestUsers.extract(m, "\"id\":\"([^\"]+)\"");
        mvc.perform(post("/api/trips/" + tripId + "/messages/" + msgId + "/reactions/👍").header("Authorization", "Bearer " + vale)).andExpect(status().isNoContent());
        // foto: Vale in due luoghi (un luogo si salva solo con le coordinate), Marco l'ultima e senza luogo
        mvc.perform(multipart("/api/trips/" + tripId + "/photos").file(PhotoControllerTest.file(PhotoControllerTest.jpeg(400, 300)))
                .param("placeName", "Alfama").param("latitude", "38.7112").param("longitude", "-9.1277").header("Authorization", "Bearer " + vale)).andExpect(status().isCreated());
        Thread.sleep(20);
        mvc.perform(multipart("/api/trips/" + tripId + "/photos").file(PhotoControllerTest.file(PhotoControllerTest.jpeg(400, 300)))
                .param("placeName", "Belém").param("latitude", "38.6979").param("longitude", "-9.2065").header("Authorization", "Bearer " + vale)).andExpect(status().isCreated());
        Thread.sleep(20);
        String last = mvc.perform(multipart("/api/trips/" + tripId + "/photos").file(PhotoControllerTest.file(PhotoControllerTest.jpeg(400, 300)))
                .header("Authorization", "Bearer " + marco)).andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        String lastPhoto = TestUsers.extract(last, "\"id\":\"([^\"]+)\"");

        // prima della chiusura ma a data passata: aperto lo stesso (stessa regola della Home)
        mvc.perform(get("/api/trips/" + tripId + "/wrapped").header("Authorization", "Bearer " + vale))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.trip.nights").value(4)).andExpect(jsonPath("$.trip.people").value(3))
                .andExpect(jsonPath("$.totals.groupTotal").value(500.00))                       // 300 + 200, la cestinata no
                .andExpect(jsonPath("$.totals.perPerson").value(250.00))                         // 2 persone con quote
                .andExpect(jsonPath("$.totals.expenseCount").value(2))
                .andExpect(jsonPath("$.totals.messages").value(1)).andExpect(jsonPath("$.totals.reactions").value(1))
                .andExpect(jsonPath("$.byCategory[0].category").value("FOOD")).andExpect(jsonPath("$.byCategory[0].amount").value(300.00)).andExpect(jsonPath("$.byCategory[0].share").value(60))
                .andExpect(jsonPath("$.byCategory[1].share").value(40))
                .andExpect(jsonPath("$.biggestExpense.description").value("Casa")).andExpect(jsonPath("$.biggestExpense.payerName").value("Vale"))
                .andExpect(jsonPath("$.priciestDay.amount").value(300.00))                       // «Casa» è del 2026-11-02 (data fissa di TestExpenses), l'appartamento di 6 giorni fa
                .andExpect(jsonPath("$.people", hasSize(3)))
                .andExpect(jsonPath("$.totals.photos").value(3))
                .andExpect(jsonPath("$.trip.coverPhotoId").value(lastPhoto))                    // copertina: l'ultima foto caricata
                .andExpect(jsonPath("$.moments", hasSize(3)))
                .andExpect(jsonPath("$.moments[0].placeName").value("Belém")).andExpect(jsonPath("$.moments[0].latitude").value(38.6979))   // prima quelle con un luogo, dalla più recente
                .andExpect(jsonPath("$.moments[1].placeName").value("Alfama")).andExpect(jsonPath("$.moments[1].latitude").value(38.7112))
                .andExpect(jsonPath("$.moments[2].placeName").value(nullValue()))
                .andExpect(jsonPath("$.people[?(@.displayName=='Vale')].photos").value(2))
                .andExpect(jsonPath("$.people[?(@.displayName=='Vale')].places").value(2))
                .andExpect(jsonPath("$.people[?(@.displayName=='Marco')].places").value(0))
                .andExpect(jsonPath("$.badges[?(@.code=='PHOTOGRAPHER')].participantId").value(valeP.toString()))
                .andExpect(jsonPath("$.badges[?(@.code=='EXPLORER')].participantId").value(valeP.toString()))
                .andExpect(jsonPath("$.badges[?(@.code=='BANKER')].participantId").value(valeP.toString()))
                .andExpect(jsonPath("$.badges[?(@.code=='VOICE')].participantId").value(marcoP.toString()))
                .andExpect(jsonPath("$.badges[?(@.code=='PUNCTUAL')].participantId").value(marcoP.toString()))
                .andExpect(jsonPath("$.badges[?(@.code=='COMPANION')]", hasSize(1)))             // Nonna Pina
                .andExpect(jsonPath("$.settlement.settled").value(false))
                .andExpect(jsonPath("$.guess.mine").value(nullValue())).andExpect(jsonPath("$.guess.played").value(0));

        // ipotesi: Vale 450 (scarto 50), Marco 520 (scarto 20); chi non ha giocato non vede le altrui
        mvc.perform(post("/api/trips/" + tripId + "/wrapped/guess").header("Authorization", "Bearer " + vale).contentType(APPLICATION_JSON).content("{\"amount\":450}")).andExpect(status().isNoContent());
        mvc.perform(get("/api/trips/" + tripId + "/wrapped").header("Authorization", "Bearer " + marco))
                .andExpect(jsonPath("$.guess.mine").value(nullValue())).andExpect(jsonPath("$.guess.played").value(1)).andExpect(jsonPath("$.guess.others").value(nullValue()));
        mvc.perform(post("/api/trips/" + tripId + "/wrapped/guess").header("Authorization", "Bearer " + marco).contentType(APPLICATION_JSON).content("{\"amount\":520}")).andExpect(status().isNoContent());
        mvc.perform(get("/api/trips/" + tripId + "/wrapped").header("Authorization", "Bearer " + marco))
                .andExpect(jsonPath("$.guess.mine").value(520.00)).andExpect(jsonPath("$.guess.played").value(2))
                .andExpect(jsonPath("$.guess.others[0].displayName").value("Marco")).andExpect(jsonPath("$.guess.others[0].diff").value(20.00))
                .andExpect(jsonPath("$.guess.others[1].displayName").value("Vale")).andExpect(jsonPath("$.guess.others[1].diff").value(50.00));
        mvc.perform(post("/api/trips/" + tripId + "/wrapped/guess").header("Authorization", "Bearer " + marco).contentType(APPLICATION_JSON).content("{\"amount\":1}")).andExpect(status().isConflict());
        mvc.perform(post("/api/trips/" + tripId + "/wrapped/guess").header("Authorization", "Bearer " + vale).contentType(APPLICATION_JSON).content("{\"amount\":-5}")).andExpect(status().isBadRequest());
    }

    @Test
    void primaDellaFineIlRiepilogoNonCe() throws Exception {
        String vale = TestUsers.register(mvc, "Vale");
        String estraneo = TestUsers.register(mvc, "Estraneo");
        UUID tripId = createTrip(vale, today.plusDays(10), today.plusDays(14));
        mvc.perform(get("/api/trips/" + tripId + "/wrapped").header("Authorization", "Bearer " + vale)).andExpect(status().isConflict());
        mvc.perform(post("/api/trips/" + tripId + "/wrapped/guess").header("Authorization", "Bearer " + vale).contentType(APPLICATION_JSON).content("{\"amount\":10}")).andExpect(status().isConflict());
        mvc.perform(patch("/api/trips/" + tripId).header("Authorization", "Bearer " + vale).contentType(APPLICATION_JSON).content("{\"status\":\"ONGOING\"}"));
        mvc.perform(patch("/api/trips/" + tripId).header("Authorization", "Bearer " + vale).contentType(APPLICATION_JSON).content("{\"status\":\"CLOSED\"}"));
        mvc.perform(get("/api/trips/" + tripId + "/wrapped").header("Authorization", "Bearer " + vale)).andExpect(status().isOk());   // chiuso: aperto anche se la data è futura
        mvc.perform(get("/api/trips/" + tripId + "/wrapped").header("Authorization", "Bearer " + estraneo)).andExpect(status().isForbidden());
    }

    @Test
    void viaggioVuotoNonRompeNiente() throws Exception {                                       // Review Focus 1
        String vale = TestUsers.register(mvc, "Vale");
        UUID tripId = createTrip(vale, today.minusDays(3), today.minusDays(1));
        mvc.perform(get("/api/trips/" + tripId + "/wrapped").header("Authorization", "Bearer " + vale))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totals.groupTotal").value(0)).andExpect(jsonPath("$.totals.perPerson").value(0))
                .andExpect(jsonPath("$.byCategory", hasSize(0))).andExpect(jsonPath("$.biggestExpense").value(nullValue())).andExpect(jsonPath("$.priciestDay").value(nullValue()))
                .andExpect(jsonPath("$.moments", hasSize(0))).andExpect(jsonPath("$.trip.coverPhotoId").value(nullValue()))
                .andExpect(jsonPath("$.badges", hasSize(1))).andExpect(jsonPath("$.badges[0].code").value("COMPANION"))
                .andExpect(jsonPath("$.settlement.settled").value(true)).andExpect(jsonPath("$.settlement.openTransfers").value(0));
        mvc.perform(post("/api/trips/" + tripId + "/wrapped/guess").header("Authorization", "Bearer " + vale).contentType(APPLICATION_JSON).content("{\"amount\":0}")).andExpect(status().isNoContent());
        mvc.perform(get("/api/trips/" + tripId + "/wrapped").header("Authorization", "Bearer " + vale))
                .andExpect(jsonPath("$.guess.others", hasSize(1))).andExpect(jsonPath("$.guess.others[0].diff").value(0));
    }

    @Test
    void dueIpotesiInsiemeUnaSolaRiga() throws Exception {                                     // Review Focus 2
        String vale = TestUsers.register(mvc, "Vale");
        UUID tripId = createTrip(vale, today.minusDays(3), today.minusDays(1));
        AtomicInteger ok = new AtomicInteger(), conflict = new AtomicInteger(), other = new AtomicInteger();
        CountDownLatch go = new CountDownLatch(1);
        Runnable send = () -> {
            try {
                go.await();
                int status = mvc.perform(post("/api/trips/" + tripId + "/wrapped/guess").header("Authorization", "Bearer " + vale).contentType(APPLICATION_JSON).content("{\"amount\":100}"))
                        .andReturn().getResponse().getStatus();
                if (status == 204) ok.incrementAndGet(); else if (status == 409) conflict.incrementAndGet(); else other.incrementAndGet();
            } catch (Exception e) { other.incrementAndGet(); }
        };
        Thread a = new Thread(send), b = new Thread(send);
        a.start(); b.start(); go.countDown(); a.join(); b.join();
        assertThat(ok.get()).isEqualTo(1);
        assertThat(conflict.get()).isEqualTo(1);
        assertThat(other.get()).isZero();                                                       // mai un 500
    }
}
