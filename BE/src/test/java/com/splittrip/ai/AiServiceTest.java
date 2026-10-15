package com.splittrip.ai;

import com.splittrip.IntegrationTest;
import com.splittrip.TestTrips;
import com.splittrip.TestUsers;
import com.splittrip.weather.OpenMeteoClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AiServiceTest extends IntegrationTest {

    static final String TIPS = """
            {"tips":[{"title":"Tram 28","text":"Presto la mattina.","category":"SEE"},
                     {"title":"Pastéis","text":"A Belém.","category":"EAT"},
                     {"title":"Ombrello","text":"Pioggia.","category":"PACK"}]}
            """;

    @MockitoBean AiClient ai;
    @MockitoBean OpenMeteoClient openMeteo; // niente rete nei test: senza coordinate il meteo è vuoto

    @BeforeEach
    void setUp() {
        when(ai.available()).thenReturn(true);
        when(openMeteo.geocode(any())).thenReturn(Optional.empty());
    }

    @Test
    void generaESalvaIConsigliSenzaDatiPersonali() throws Exception {
        when(ai.complete(anyString(), anyString())).thenReturn(TIPS);
        String vale = TestUsers.register(mvc, "Vale");
        UUID tripId = TestTrips.create(mvc, vale, "Roma");
        mvc.perform(get("/api/trips/" + tripId + "/ai/tips").header("Authorization", "Bearer " + vale))
                .andExpect(jsonPath("$.available").value(true)).andExpect(jsonPath("$.tips", hasSize(0))).andExpect(jsonPath("$.remainingToday").value(5));
        mvc.perform(post("/api/trips/" + tripId + "/ai/tips").header("Authorization", "Bearer " + vale))
                .andExpect(status().isOk()).andExpect(jsonPath("$.tips", hasSize(3))).andExpect(jsonPath("$.remainingToday").value(4));
        mvc.perform(get("/api/trips/" + tripId + "/ai/tips").header("Authorization", "Bearer " + vale))
                .andExpect(jsonPath("$.tips[0].title").value("Tram 28")).andExpect(jsonPath("$.generatedAt").exists());

        ArgumentCaptor<String> user = ArgumentCaptor.forClass(String.class);
        verify(ai).complete(anyString(), user.capture());
        assertThat(user.getValue()).contains("Destinazione: Roma").doesNotContain("Vale").doesNotContain("@example.com");
    }

    @Test
    void rispostaRottaDa503ENonConsumaIlLimite() throws Exception {
        when(ai.complete(anyString(), anyString())).thenReturn("Mi dispiace, non posso.");
        String vale = TestUsers.register(mvc, "Vale");
        UUID tripId = TestTrips.create(mvc, vale, "Roma");
        mvc.perform(post("/api/trips/" + tripId + "/ai/tips").header("Authorization", "Bearer " + vale))
                .andExpect(status().isServiceUnavailable()).andExpect(jsonPath("$.detail").value("Consigli non disponibili, riprova tra poco"));
        mvc.perform(get("/api/trips/" + tripId + "/ai/tips").header("Authorization", "Bearer " + vale))
                .andExpect(jsonPath("$.remainingToday").value(5));
    }

    @Test
    void laSestaGenerazioneDelGiornoDa429() throws Exception {
        when(ai.complete(anyString(), anyString())).thenReturn(TIPS);
        String vale = TestUsers.register(mvc, "Vale");
        UUID tripId = TestTrips.create(mvc, vale, "Roma");
        for (int i = 0; i < 5; i++) mvc.perform(post("/api/trips/" + tripId + "/ai/tips").header("Authorization", "Bearer " + vale)).andExpect(status().isOk());
        mvc.perform(post("/api/trips/" + tripId + "/ai/tips").header("Authorization", "Bearer " + vale))
                .andExpect(status().isTooManyRequests()).andExpect(jsonPath("$.detail").value("Hai usato le 5 generazioni di oggi"));
    }

    @Test
    void senzaChiaveNonDisponibileEViaggioChiusoDa409() throws Exception {
        String vale = TestUsers.register(mvc, "Vale");
        String estraneo = TestUsers.register(mvc, "Estraneo");
        UUID tripId = TestTrips.create(mvc, vale, "Roma");
        mvc.perform(get("/api/trips/" + tripId + "/ai/tips").header("Authorization", "Bearer " + estraneo)).andExpect(status().isForbidden());

        when(ai.available()).thenReturn(false);
        mvc.perform(get("/api/trips/" + tripId + "/ai/tips").header("Authorization", "Bearer " + vale)).andExpect(jsonPath("$.available").value(false));
        mvc.perform(post("/api/trips/" + tripId + "/ai/tips").header("Authorization", "Bearer " + vale)).andExpect(status().isServiceUnavailable());

        when(ai.available()).thenReturn(true);
        mvc.perform(patch("/api/trips/" + tripId).header("Authorization", "Bearer " + vale)
                .contentType(APPLICATION_JSON).content("{\"status\":\"CLOSED\"}")).andExpect(status().isOk());
        mvc.perform(post("/api/trips/" + tripId + "/ai/tips").header("Authorization", "Bearer " + vale)).andExpect(status().isConflict());
    }

    @Test
    void valigiaPropostaSenzaDoppioniESoloPerLeListeValigia() throws Exception {
        when(ai.complete(anyString(), anyString())).thenReturn("{\"items\":[{\"text\":\"phon\"},{\"text\":\"Ombrello\"},{\"text\":\"Adattatore\"}]}");
        String vale = TestUsers.register(mvc, "Vale");
        UUID tripId = TestTrips.create(mvc, vale, "Roma");
        String lists = "/api/trips/" + tripId + "/todo-lists";
        String packing = TestUsers.extract(mvc.perform(post(lists).header("Authorization", "Bearer " + vale).contentType(APPLICATION_JSON)
                .content("{\"title\":\"Valigia\",\"type\":\"PACKING\"}")).andReturn().getResponse().getContentAsString(), "\"id\":\"([^\"]+)\"");
        mvc.perform(post(lists + "/" + packing + "/items").header("Authorization", "Bearer " + vale).contentType(APPLICATION_JSON)
                .content("{\"text\":\"Phon\"}")).andExpect(status().isCreated());
        String general = TestUsers.extract(mvc.perform(post(lists).header("Authorization", "Bearer " + vale).contentType(APPLICATION_JSON)
                .content("{\"title\":\"Da fare\",\"type\":\"GENERAL\"}")).andReturn().getResponse().getContentAsString(), "\"id\":\"([^\"]+)\"");

        mvc.perform(post(lists + "/" + packing + "/ai/suggestions").header("Authorization", "Bearer " + vale))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items", hasSize(2))).andExpect(jsonPath("$.items[0]").value("Ombrello"))
                .andExpect(jsonPath("$.remainingToday").value(4));
        mvc.perform(post(lists + "/" + general + "/ai/suggestions").header("Authorization", "Bearer " + vale))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.detail").value("I suggerimenti sono solo per le liste Valigia"));
        ArgumentCaptor<String> user = ArgumentCaptor.forClass(String.class);
        verify(ai).complete(anyString(), user.capture());
        assertThat(user.getValue()).contains("Già in valigia: Phon");
    }
}
