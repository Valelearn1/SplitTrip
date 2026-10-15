package com.splittrip.weather;

import com.splittrip.IntegrationTest;
import com.splittrip.TestTrips;
import com.splittrip.TestUsers;
import org.junit.jupiter.api.Test;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.web.client.ResourceAccessException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.mockito.Mockito.never;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

class WeatherControllerTest extends IntegrationTest {

    @MockitoBean
    OpenMeteoClient openMeteo;

    @Test
    void previsioniPerIGiorniDelViaggioECacheDelleCoordinate() throws Exception {
        when(openMeteo.geocode("Roma")).thenReturn(Optional.of(new OpenMeteoClient.Coordinates(new BigDecimal("41.9"), new BigDecimal("12.5"))));
        when(openMeteo.forecast(any(), any())).thenReturn(List.of(
                new OpenMeteoClient.DayForecast(LocalDate.of(2026, 10, 31), 0, new BigDecimal("12"), new BigDecimal("20")), // prima del viaggio
                new OpenMeteoClient.DayForecast(LocalDate.of(2026, 11, 1), 3, new BigDecimal("11"), new BigDecimal("18"))));
        String vale = TestUsers.register(mvc, "Vale");
        UUID tripId = TestTrips.create(mvc, vale, "Roma"); // 1–5 novembre, destinazione «Roma»
        mvc.perform(get("/api/trips/" + tripId + "/weather").header("Authorization", "Bearer " + vale))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.days", hasSize(1)))
                .andExpect(jsonPath("$.days[0].date").value("2026-11-01"))
                .andExpect(jsonPath("$.days[0].code").value(3));
        mvc.perform(get("/api/trips/" + tripId + "/weather").header("Authorization", "Bearer " + vale)).andExpect(status().isOk());
        verify(openMeteo, times(1)).geocode("Roma");       // coordinate salvate sul viaggio
        verify(openMeteo, times(1)).forecast(any(), any()); // cache di 1 h
    }

    @Test
    void cambiareDestinazioneODateRinnovaLePrevisioni() throws Exception {
        when(openMeteo.geocode(any())).thenReturn(Optional.of(new OpenMeteoClient.Coordinates(new BigDecimal("41.9"), new BigDecimal("12.5"))));
        when(openMeteo.forecast(any(), any())).thenReturn(List.of(
                new OpenMeteoClient.DayForecast(LocalDate.of(2026, 11, 1), 3, new BigDecimal("11"), new BigDecimal("18")),
                new OpenMeteoClient.DayForecast(LocalDate.of(2026, 11, 7), 0, new BigDecimal("14"), new BigDecimal("21"))));
        String vale = TestUsers.register(mvc, "Vale");
        UUID tripId = TestTrips.create(mvc, vale, "Roma"); // 1–5 novembre
        mvc.perform(get("/api/trips/" + tripId + "/weather").header("Authorization", "Bearer " + vale))
                .andExpect(jsonPath("$.days", hasSize(1)));

        mvc.perform(patch("/api/trips/" + tripId).header("Authorization", "Bearer " + vale)
                .contentType(APPLICATION_JSON).content("{\"destination\":\"Lisbona\",\"endDate\":\"2026-11-08\"}")).andExpect(status().isOk());
        mvc.perform(get("/api/trips/" + tripId + "/weather").header("Authorization", "Bearer " + vale))
                .andExpect(jsonPath("$.days", hasSize(2)));       // nuove date, non la cache di prima
        verify(openMeteo).geocode("Lisbona");                       // nuova destinazione
        verify(openMeteo, times(2)).forecast(any(), any());
    }

    @Test
    void servizioGiuOTimeoutDannoVuotoNon500() throws Exception {
        when(openMeteo.geocode(any())).thenThrow(new ResourceAccessException("timeout"));
        String vale = TestUsers.register(mvc, "Vale");
        UUID tripId = TestTrips.create(mvc, vale, "Atlantide");
        mvc.perform(get("/api/trips/" + tripId + "/weather").header("Authorization", "Bearer " + vale))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.days", hasSize(0)));
    }

    @Test
    void soloIMembriVedonoIlMeteo() throws Exception {
        String vale = TestUsers.register(mvc, "Vale");
        String estraneo = TestUsers.register(mvc, "Estraneo");
        UUID tripId = TestTrips.create(mvc, vale, "Roma");
        mvc.perform(get("/api/trips/" + tripId + "/weather").header("Authorization", "Bearer " + estraneo))
                .andExpect(status().isForbidden());
    }

    @Test
    void conLeCoordinateDateIlGeocodingNonServe() throws Exception {
        when(openMeteo.forecast(any(), any())).thenReturn(List.of(new OpenMeteoClient.DayForecast(LocalDate.of(2026, 11, 1), 1, new BigDecimal("10"), new BigDecimal("16"))));
        String vale = TestUsers.register(mvc, "Vale");
        String body = mvc.perform(post("/api/trips").header("Authorization", "Bearer " + vale).contentType(APPLICATION_JSON).content("""
                {"name":"Lisbona","destination":"Lisbona","startDate":"2026-11-01","endDate":"2026-11-05","latitude":38.7169,"longitude":-9.1399}
                """)).andReturn().getResponse().getContentAsString();
        UUID tripId = UUID.fromString(TestUsers.extract(body, "\"id\":\"([^\"]+)\""));
        mvc.perform(get("/api/trips/" + tripId + "/weather").header("Authorization", "Bearer " + vale))
                .andExpect(jsonPath("$.days", hasSize(1)));
        verify(openMeteo, never()).geocode(any());
    }
}
