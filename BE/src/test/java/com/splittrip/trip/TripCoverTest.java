package com.splittrip.trip;

import com.splittrip.IntegrationTest;
import com.splittrip.TestExpenses;
import com.splittrip.TestTrips;
import com.splittrip.TestUsers;
import com.splittrip.photo.PhotoControllerTest;
import com.splittrip.weather.OpenMeteoClient;
import org.junit.jupiter.api.Test;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.UUID;

import static org.hamcrest.Matchers.nullValue;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Copertina del viaggio (D-71): una foto scelta da chiunque sia nel viaggio; senza scelta resta l'ultima caricata. */
class TripCoverTest extends IntegrationTest {

    @MockitoBean OpenMeteoClient openMeteo;   // niente rete nei test

    UUID upload(String token, UUID tripId) throws Exception {
        String body = mvc.perform(multipart("/api/trips/" + tripId + "/photos").file(PhotoControllerTest.file(PhotoControllerTest.jpeg(400, 300)))
                .header("Authorization", "Bearer " + token)).andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        return UUID.fromString(TestUsers.extract(body, "\"id\":\"([^\"]+)\""));
    }

    String cover(UUID photoId) { return "{\"photoId\":\"" + photoId + "\"}"; }

    @Test
    void chiunqueNelViaggioSceglieLaCopertinaELaHomeLaPreferisceAllUltimaFoto() throws Exception {
        String ada = TestUsers.register(mvc, "Ada"), bruno = TestUsers.register(mvc, "Bruno"), estranea = TestUsers.register(mvc, "Estranea");
        UUID tripId = TestTrips.create(mvc, ada, "Lisbona");
        TestTrips.join(mvc, bruno, TestTrips.inviteCode(mvc, ada, tripId));
        UUID prima = upload(ada, tripId);
        Thread.sleep(20);
        UUID ultima = upload(bruno, tripId);

        mvc.perform(get("/api/trips/" + tripId).header("Authorization", "Bearer " + ada))
                .andExpect(jsonPath("$.coverPhotoId").value(nullValue()));                         // senza scelta
        mvc.perform(get("/api/me/home").header("Authorization", "Bearer " + ada))
                .andExpect(jsonPath("$.featured.coverPhotoId").value(ultima.toString()));          // la Home mostra l'ultima

        mvc.perform(put("/api/trips/" + tripId + "/cover").header("Authorization", "Bearer " + bruno)   // Bruno non organizza: può lo stesso
                        .contentType(APPLICATION_JSON).content(cover(prima)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.coverPhotoId").value(prima.toString()));
        mvc.perform(get("/api/me/home").header("Authorization", "Bearer " + ada))
                .andExpect(jsonPath("$.featured.coverPhotoId").value(prima.toString()));           // ora la scelta

        mvc.perform(put("/api/trips/" + tripId + "/cover").header("Authorization", "Bearer " + estranea)
                        .contentType(APPLICATION_JSON).content(cover(prima)))
                .andExpect(status().isForbidden());

        mvc.perform(delete("/api/trips/" + tripId + "/cover").header("Authorization", "Bearer " + ada))
                .andExpect(status().isNoContent());
        mvc.perform(get("/api/trips/" + tripId).header("Authorization", "Bearer " + ada))
                .andExpect(jsonPath("$.coverPhotoId").value(nullValue()));
    }

    @Test
    void soloUnaFotoDelViaggioNonUnoScontrinoNeUnaFotoDiUnAltroViaggio() throws Exception {
        String ada = TestUsers.register(mvc, "Ada");
        UUID tripId = TestTrips.create(mvc, ada, "Lisbona"), altro = TestTrips.create(mvc, ada, "Roma");
        UUID adaP = TestTrips.participantOf(mvc, ada, tripId);
        UUID altrui = upload(ada, altro);
        UUID spesa = TestExpenses.createEqual(mvc, ada, tripId, "Cena", "40.00", adaP, adaP);
        String body = mvc.perform(multipart("/api/trips/" + tripId + "/photos").file(PhotoControllerTest.file(PhotoControllerTest.jpeg(400, 300)))
                .param("expenseId", spesa.toString()).header("Authorization", "Bearer " + ada)).andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        UUID scontrino = UUID.fromString(TestUsers.extract(body, "\"id\":\"([^\"]+)\""));

        for (UUID no : new UUID[] {altrui, scontrino, UUID.randomUUID()}) {
            mvc.perform(put("/api/trips/" + tripId + "/cover").header("Authorization", "Bearer " + ada).contentType(APPLICATION_JSON).content(cover(no)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.detail").value("La copertina deve essere una foto di questo viaggio"));
        }
        mvc.perform(put("/api/trips/" + tripId + "/cover").header("Authorization", "Bearer " + ada).contentType(APPLICATION_JSON).content("{}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void eliminandoLaFotoLaCopertinaSparisceEIlRiepilogoUsaQuellaScelta() throws Exception {
        String ada = TestUsers.register(mvc, "Ada");
        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        String body = mvc.perform(post("/api/trips").header("Authorization", "Bearer " + ada).contentType(APPLICATION_JSON).content("""
                {"name":"Lisbona","destination":"Lisbona","startDate":"%s","endDate":"%s","latitude":38.7,"longitude":-9.1}
                """.formatted(today.minusDays(6), today.minusDays(2)))).andReturn().getResponse().getContentAsString();
        UUID tripId = UUID.fromString(TestUsers.extract(body, "\"id\":\"([^\"]+)\""));
        UUID prima = upload(ada, tripId);
        Thread.sleep(20);
        UUID ultima = upload(ada, tripId);

        mvc.perform(get("/api/trips/" + tripId + "/wrapped").header("Authorization", "Bearer " + ada))
                .andExpect(jsonPath("$.trip.coverPhotoId").value(ultima.toString()));
        mvc.perform(put("/api/trips/" + tripId + "/cover").header("Authorization", "Bearer " + ada).contentType(APPLICATION_JSON).content(cover(prima)))
                .andExpect(status().isOk());
        mvc.perform(get("/api/trips/" + tripId + "/wrapped").header("Authorization", "Bearer " + ada))
                .andExpect(jsonPath("$.trip.coverPhotoId").value(prima.toString()));

        mvc.perform(delete("/api/trips/" + tripId + "/photos/" + prima).header("Authorization", "Bearer " + ada)).andExpect(status().isNoContent());
        mvc.perform(get("/api/trips/" + tripId).header("Authorization", "Bearer " + ada))
                .andExpect(jsonPath("$.coverPhotoId").value(nullValue()));                         // la colonna si azzera da sola (V11)
        mvc.perform(get("/api/trips/" + tripId + "/wrapped").header("Authorization", "Bearer " + ada))
                .andExpect(jsonPath("$.trip.coverPhotoId").value(ultima.toString()));              // torna l'ultima
    }
}
