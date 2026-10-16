package com.splittrip.home;

import com.splittrip.IntegrationTest;
import com.splittrip.TestExpenses;
import com.splittrip.TestTrips;
import com.splittrip.TestUsers;
import com.splittrip.weather.OpenMeteoClient;
import org.junit.jupiter.api.Test;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.Optional;
import java.util.UUID;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.nullValue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class HomeControllerTest extends IntegrationTest {

    @MockitoBean OpenMeteoClient openMeteo;

    /** Il Clock dell'app è quello di sistema: le date del test sono relative a oggi (UTC, come l'app). */
    final LocalDate today = LocalDate.now(ZoneOffset.UTC);

    UUID createTrip(String token, String name, LocalDate start, LocalDate end) throws Exception {
        String body = mvc.perform(post("/api/trips").header("Authorization", "Bearer " + token).contentType(APPLICATION_JSON).content("""
                {"name":"%s","destination":"%s","startDate":"%s","endDate":"%s","latitude":41.9,"longitude":12.5}
                """.formatted(name, name, start, end))).andReturn().getResponse().getContentAsString();
        return UUID.fromString(TestUsers.extract(body, "\"id\":\"([^\"]+)\""));
    }

    @Test
    void senzaViaggiLaHomeEVuotaMaValida() throws Exception {
        String vale = TestUsers.register(mvc, "Vale");
        mvc.perform(get("/api/me/home").header("Authorization", "Bearer " + vale))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.featured").value(nullValue()))
                .andExpect(jsonPath("$.balances", hasSize(0)))
                .andExpect(jsonPath("$.totals.toReceive").value(0))
                .andExpect(jsonPath("$.trips.current", hasSize(0)));
    }

    @Test
    void viaggioInEvidenzaContiENovita() throws Exception {
        when(openMeteo.geocode(any())).thenReturn(Optional.empty());
        String vale = TestUsers.register(mvc, "Vale");
        String marco = TestUsers.register(mvc, "Marco");
        // un viaggio passato (chiuso), uno in corso, uno futuro: in evidenza va quello in corso
        UUID past = createTrip(vale, "Passato", today.minusDays(45), today.minusDays(41));
        UUID ongoing = createTrip(vale, "InCorso", today.minusDays(2), today.plusDays(3)); // 6 giorni, oggi è il 3°
        UUID future = createTrip(vale, "Futuro", today.plusDays(17), today.plusDays(22));
        mvc.perform(patch("/api/trips/" + past).header("Authorization", "Bearer " + vale).contentType(APPLICATION_JSON).content("{\"status\":\"CLOSED\"}"));
        mvc.perform(patch("/api/trips/" + ongoing).header("Authorization", "Bearer " + vale).contentType(APPLICATION_JSON).content("{\"status\":\"ONGOING\"}"));
        TestTrips.join(mvc, marco, TestTrips.inviteCode(mvc, vale, ongoing));
        TestTrips.join(mvc, marco, TestTrips.inviteCode(mvc, vale, future));
        UUID valeP = TestTrips.participantOf(mvc, vale, ongoing);
        UUID marcoP = TestTrips.participantOf(mvc, marco, ongoing);
        TestExpenses.createEqual(mvc, vale, ongoing, "Cena", "40.00", valeP, valeP, marcoP);   // Vale +20
        UUID valeF = TestTrips.participantOf(mvc, vale, future);
        UUID marcoF = TestTrips.participantOf(mvc, marco, future);
        TestExpenses.createEqual(mvc, marco, future, "Treno", "30.00", marcoF, valeF, marcoF); // Vale −15

        mvc.perform(get("/api/me/home").header("Authorization", "Bearer " + vale))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.featured.trip.name").value("InCorso"))
                .andExpect(jsonPath("$.featured.status").value("ONGOING"))
                .andExpect(jsonPath("$.featured.totalDays").value(6))
                .andExpect(jsonPath("$.featured.dayOfTotal").value(3))
                .andExpect(jsonPath("$.featured.myNet").value(20.00))
                .andExpect(jsonPath("$.featured.coverPhotoId").value(nullValue()))
                .andExpect(jsonPath("$.balances", hasSize(2)))
                .andExpect(jsonPath("$.totals.toReceive").value(20.00))
                .andExpect(jsonPath("$.totals.toGive").value(15.00))
                .andExpect(jsonPath("$.totals.tripsToReceive").value(1))
                .andExpect(jsonPath("$.totals.tripsToGive").value(1))
                .andExpect(jsonPath("$.latestNotifications", hasSize(3)))     // 2 ingressi di Marco + 1 spesa (max 3)
                .andExpect(jsonPath("$.trips.current", hasSize(2)))
                .andExpect(jsonPath("$.trips.past", hasSize(1)));

        // Marco: nessun viaggio in corso con saldo per lui? ha −20 in InCorso e +15 in Futuro
        mvc.perform(get("/api/me/home").header("Authorization", "Bearer " + marco))
                .andExpect(jsonPath("$.featured.trip.name").value("InCorso"))
                .andExpect(jsonPath("$.totals.toGive").value(20.00))
                .andExpect(jsonPath("$.totals.toReceive").value(15.00));
    }

    @Test
    void senzaViaggiInCorsoVaInEvidenzaIlProssimoOppureLUltimoChiuso() throws Exception {
        when(openMeteo.geocode(any())).thenReturn(Optional.empty());
        String vale = TestUsers.register(mvc, "Vale");
        UUID far = createTrip(vale, "Lontano", today.plusDays(137), today.plusDays(141));
        UUID near = createTrip(vale, "Vicino", today.plusDays(47), today.plusDays(51));
        mvc.perform(get("/api/me/home").header("Authorization", "Bearer " + vale))
                .andExpect(jsonPath("$.featured.trip.name").value("Vicino")).andExpect(jsonPath("$.featured.status").value("UPCOMING"))
                .andExpect(jsonPath("$.featured.daysUntil").value(47));
        mvc.perform(patch("/api/trips/" + near).header("Authorization", "Bearer " + vale).contentType(APPLICATION_JSON).content("{\"status\":\"CLOSED\"}"));
        mvc.perform(patch("/api/trips/" + far).header("Authorization", "Bearer " + vale).contentType(APPLICATION_JSON).content("{\"status\":\"CLOSED\"}"));
        mvc.perform(get("/api/me/home").header("Authorization", "Bearer " + vale))
                .andExpect(jsonPath("$.featured.trip.name").value("Lontano")).andExpect(jsonPath("$.featured.status").value("PAST"));
    }

    @Test
    void dodiciViaggiUnaChiamataSola() throws Exception {   // Review Focus 4
        when(openMeteo.geocode(any())).thenReturn(Optional.empty());
        String vale = TestUsers.register(mvc, "Vale");
        for (int i = 1; i <= 12; i++) createTrip(vale, "Viaggio " + i, today.plusDays(30L * i), today.plusDays(30L * i + 2));
        mvc.perform(get("/api/me/home").header("Authorization", "Bearer " + vale))
                .andExpect(status().isOk()).andExpect(jsonPath("$.trips.current", hasSize(12)));
    }

    @Test
    void unViaggioRimastoInPianificazioneSiLeggeDalleDate() throws Exception {   // revisione finale: niente «Si parte oggi» a viaggio iniziato
        when(openMeteo.geocode(any())).thenReturn(Optional.empty());
        String vale = TestUsers.register(mvc, "Vale");
        createTrip(vale, "Dimenticato", today.minusDays(2), today.plusDays(3));        // l'organizzatrice non l'ha segnato «in corso»
        mvc.perform(get("/api/me/home").header("Authorization", "Bearer " + vale))
                .andExpect(jsonPath("$.featured.trip.name").value("Dimenticato"))
                .andExpect(jsonPath("$.featured.status").value("ONGOING"))
                .andExpect(jsonPath("$.featured.dayOfTotal").value(3))
                .andExpect(jsonPath("$.featured.daysUntil").value(nullValue()));
    }

    @Test
    void unViaggioFinitoMaNonChiusoNonDiceSiParteOggi() throws Exception {
        when(openMeteo.geocode(any())).thenReturn(Optional.empty());
        String vale = TestUsers.register(mvc, "Vale");
        createTrip(vale, "Da chiudere", today.minusDays(10), today.minusDays(5));
        mvc.perform(get("/api/me/home").header("Authorization", "Bearer " + vale))
                .andExpect(jsonPath("$.featured.trip.name").value("Da chiudere"))
                .andExpect(jsonPath("$.featured.status").value("ENDED"))
                .andExpect(jsonPath("$.featured.daysUntil").value(nullValue()));
    }

    @Test
    void perUnViaggioLontanoLaHomeNonChiamaIlMeteo() throws Exception {      // il meteo di oggi serve solo durante il viaggio
        String vale = TestUsers.register(mvc, "Vale");
        createTrip(vale, "Lontano", today.plusDays(90), today.plusDays(95));
        mvc.perform(get("/api/me/home").header("Authorization", "Bearer " + vale)).andExpect(jsonPath("$.featured.status").value("UPCOMING"));
        verify(openMeteo, never()).geocode(any());
        verify(openMeteo, never()).forecast(any(), any());
    }
}
