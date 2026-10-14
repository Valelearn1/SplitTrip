package com.splittrip.photo;

import com.splittrip.IntegrationTest;
import com.splittrip.TestExpenses;
import com.splittrip.TestTrips;
import com.splittrip.TestUsers;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.util.UUID;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class PhotoControllerTest extends IntegrationTest {

    String vale, marco, giulia;
    UUID tripId, valeP;

    public static byte[] jpeg(int w, int h) throws Exception {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        ImageIO.write(new BufferedImage(w, h, BufferedImage.TYPE_INT_RGB), "jpeg", out);
        return out.toByteArray();
    }

    static MockMultipartFile file(byte[] bytes) { return new MockMultipartFile("file", "foto.jpg", "image/jpeg", bytes); }

    @BeforeEach
    void setUp() throws Exception {
        vale = TestUsers.register(mvc, "Vale");
        marco = TestUsers.register(mvc, "Marco");
        giulia = TestUsers.register(mvc, "Giulia");
        tripId = TestTrips.create(mvc, vale, "Roma");
        String code = TestTrips.inviteCode(mvc, vale, tripId);
        TestTrips.join(mvc, marco, code);
        valeP = TestTrips.participantOf(mvc, vale, tripId);
    }

    @Test
    void uploadConConsensoSalvaLaPosizioneSenzaNo() throws Exception {
        String with = mvc.perform(multipart("/api/trips/" + tripId + "/photos").file(file(jpeg(2000, 1000)))
                .param("caption", "Colosseo").param("takenAt", "2026-11-02T10:00:00Z").param("latitude", "41.8902").param("longitude", "12.4922")
                .header("Authorization", "Bearer " + marco))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.kind").value("PHOTO"))
                .andExpect(jsonPath("$.width").value(1600))
                .andExpect(jsonPath("$.latitude").value(41.8902))
                .andExpect(jsonPath("$.uploaderName").value("Marco"))
                .andReturn().getResponse().getContentAsString();
        UUID pid = UUID.fromString(TestUsers.extract(with, "\"id\":\"([^\"]+)\""));
        mvc.perform(multipart("/api/trips/" + tripId + "/photos").file(file(jpeg(800, 800))).header("Authorization", "Bearer " + vale))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.latitude").isEmpty());

        mvc.perform(get("/api/trips/" + tripId + "/photos").header("Authorization", "Bearer " + vale))
                .andExpect(jsonPath("$", hasSize(2)));
        mvc.perform(get("/api/trips/" + tripId + "/photos").param("withLocation", "true").header("Authorization", "Bearer " + vale))
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id").value(pid.toString()));

        mvc.perform(get("/api/trips/" + tripId + "/photos/" + pid + "/thumbnail").header("Authorization", "Bearer " + vale))
                .andExpect(status().isOk())
                .andExpect(content().contentType("image/jpeg"))
                .andExpect(header().string("Cache-Control", "max-age=31536000, private, immutable"));
        mvc.perform(get("/api/trips/" + tripId + "/photos/" + pid + "/image")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/trips/" + tripId + "/photos/" + pid + "/image").header("Authorization", "Bearer " + giulia)).andExpect(status().isForbidden());

        mvc.perform(delete("/api/trips/" + tripId + "/photos/" + pid).header("Authorization", "Bearer " + giulia)).andExpect(status().isForbidden());
        mvc.perform(delete("/api/trips/" + tripId + "/photos/" + pid).header("Authorization", "Bearer " + vale)).andExpect(status().isNoContent()); // organizzatrice
    }

    @Test
    void unaSolaCoordinataDa400SulCampo() throws Exception {
        mvc.perform(multipart("/api/trips/" + tripId + "/photos").file(file(jpeg(100, 100))).param("latitude", "41.9")
                .header("Authorization", "Bearer " + vale))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors[0].field").value("longitude"));
    }

    @Test
    void fileNonImmagineETroppoGrande() throws Exception {
        mvc.perform(multipart("/api/trips/" + tripId + "/photos").file(new MockMultipartFile("file", "x.jpg", "image/jpeg", "testo".getBytes()))
                .header("Authorization", "Bearer " + vale))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Il file non è un'immagine"));
        mvc.perform(multipart("/api/trips/" + tripId + "/photos").file(new MockMultipartFile("file", "x.jpg", "image/jpeg", new byte[3 * 1024 * 1024 + 1]))
                .header("Authorization", "Bearer " + vale))
                .andExpect(status().isPayloadTooLarge());
    }

    @Test
    void scontrinoUnicoPerSpesaEVisibileNellaSpesa() throws Exception {
        UUID expenseId = TestExpenses.createEqual(mvc, vale, tripId, "Cena", "20.00", valeP, valeP);
        String r = mvc.perform(multipart("/api/trips/" + tripId + "/photos").file(file(jpeg(500, 500))).param("expenseId", expenseId.toString())
                .header("Authorization", "Bearer " + vale))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.kind").value("RECEIPT"))
                .andReturn().getResponse().getContentAsString();
        UUID rid = UUID.fromString(TestUsers.extract(r, "\"id\":\"([^\"]+)\""));
        mvc.perform(multipart("/api/trips/" + tripId + "/photos").file(file(jpeg(500, 500))).param("expenseId", expenseId.toString())
                .header("Authorization", "Bearer " + vale))
                .andExpect(status().isConflict());
        mvc.perform(get("/api/trips/" + tripId + "/expenses/" + expenseId).header("Authorization", "Bearer " + vale))
                .andExpect(jsonPath("$.receiptPhotoId").value(rid.toString()));
        mvc.perform(get("/api/trips/" + tripId + "/photos").header("Authorization", "Bearer " + vale))
                .andExpect(jsonPath("$", hasSize(0))); // gli scontrini non stanno in galleria
    }
}
