package com.splittrip;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import java.util.UUID;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class SecurityHardeningTest extends IntegrationTest {

    @Test
    void sqlInjectionNellaDescrizioneVieneSalvataComeTesto() throws Exception {
        String vale = TestUsers.register(mvc, "Vale");
        UUID tripId = TestTrips.create(mvc, vale, "Roma");
        UUID valeId = TestTrips.participantOf(mvc, vale, tripId);
        String payload = "Cena'); DROP TABLE expenses; --";
        TestExpenses.createEqual(mvc, vale, tripId, payload, "10.00", valeId, valeId);

        mvc.perform(get("/api/trips/" + tripId + "/expenses").header("Authorization", "Bearer " + vale))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].description").value(payload));
    }

    @Test
    void xssNellaDescrizioneRestaTestoEIlJsonEEscapato() throws Exception {
        String vale = TestUsers.register(mvc, "Vale");
        UUID tripId = TestTrips.create(mvc, vale, "Roma");
        UUID valeId = TestTrips.participantOf(mvc, vale, tripId);
        TestExpenses.createEqual(mvc, vale, tripId, "<script>alert(1)</script>", "10.00", valeId, valeId);

        mvc.perform(get("/api/trips/" + tripId + "/expenses").header("Authorization", "Bearer " + vale))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", containsString("application/json")))
                .andExpect(header().string("X-Content-Type-Options", "nosniff"))
                .andExpect(jsonPath("$[0].description").value("<script>alert(1)</script>"));
    }

    @Test
    void lIdUtenteNelBodyVieneIgnorato() throws Exception {
        // Marco prova a creare una spesa in un viaggio altrui: l'id viene dal token, quindi 403.
        String vale = TestUsers.register(mvc, "Vale");
        String marco = TestUsers.register(mvc, "Marco");
        UUID tripId = TestTrips.create(mvc, vale, "Roma");
        UUID valeId = TestTrips.participantOf(mvc, vale, tripId);
        mvc.perform(post("/api/trips/" + tripId + "/expenses").header("Authorization", "Bearer " + marco)
                .contentType(APPLICATION_JSON).content(TestExpenses.equalBody("Cena", "10.00", valeId, valeId)))
                .andExpect(status().isForbidden());
    }

    @Test
    void gliErroriNonContengonoStackTrace() throws Exception {
        String vale = TestUsers.register(mvc, "Vale");
        mvc.perform(get("/api/trips/non-un-uuid").header("Authorization", "Bearer " + vale))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(not(containsString("Exception"))));
    }

    @Test
    void xssNellaDidascaliaDellaFotoRestaTesto() throws Exception {
        String vale = TestUsers.register(mvc, "Vale");
        UUID tripId = TestTrips.create(mvc, vale, "Roma");
        String payload = "<img src=x onerror=alert(1)>";
        mvc.perform(multipart("/api/trips/" + tripId + "/photos")
                        .file(new MockMultipartFile("file", "f.jpg", "image/jpeg", com.splittrip.photo.PhotoControllerTest.jpeg(50, 50)))
                        .param("caption", payload).header("Authorization", "Bearer " + vale))
                .andExpect(status().isCreated());
        mvc.perform(get("/api/trips/" + tripId + "/photos").header("Authorization", "Bearer " + vale))
                .andExpect(header().string("Content-Type", containsString("application/json")))
                .andExpect(jsonPath("$[0].caption").value(payload));
    }
}
