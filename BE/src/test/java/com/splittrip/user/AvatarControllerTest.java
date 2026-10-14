package com.splittrip.user;

import com.splittrip.IntegrationTest;
import com.splittrip.TestTrips;
import com.splittrip.TestUsers;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.mock.web.MockMultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AvatarControllerTest extends IntegrationTest {

    static byte[] png(int w, int h) throws Exception {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        ImageIO.write(new BufferedImage(w, h, BufferedImage.TYPE_INT_RGB), "png", out);
        return out.toByteArray();
    }

    @Test
    void avatarVisibileSoloAChiCondivideUnViaggio() throws Exception {
        String vale = TestUsers.register(mvc, "Vale");
        String marco = TestUsers.register(mvc, "Marco");
        String estraneo = TestUsers.register(mvc, "Estraneo");
        UUID valeId = TestUsers.idOf(mvc, vale);
        UUID tripId = TestTrips.create(mvc, vale, "Roma");
        TestTrips.join(mvc, marco, TestTrips.inviteCode(mvc, vale, tripId));

        mvc.perform(get("/api/me").header("Authorization", "Bearer " + vale)).andExpect(jsonPath("$.hasAvatar").value(false));
        mvc.perform(multipart(HttpMethod.PUT, "/api/me/avatar").file(new MockMultipartFile("file", "a.png", "image/png", png(400, 300)))
                .header("Authorization", "Bearer " + vale)).andExpect(status().isNoContent());
        mvc.perform(get("/api/me").header("Authorization", "Bearer " + vale)).andExpect(jsonPath("$.hasAvatar").value(true));
        mvc.perform(get("/api/trips/" + tripId).header("Authorization", "Bearer " + marco))
                .andExpect(jsonPath("$.participants[?(@.displayName=='Vale')].hasAvatar").value(true))
                .andExpect(jsonPath("$.participants[?(@.displayName=='Marco')].hasAvatar").value(false));

        mvc.perform(get("/api/users/" + valeId + "/avatar").header("Authorization", "Bearer " + marco))
                .andExpect(status().isOk()).andExpect(content().contentType("image/jpeg"));
        mvc.perform(get("/api/users/" + valeId + "/avatar").header("Authorization", "Bearer " + estraneo)).andExpect(status().isNotFound());
        mvc.perform(get("/api/users/" + valeId + "/avatar").header("Authorization", "Bearer " + vale)).andExpect(status().isOk());

        mvc.perform(delete("/api/me/avatar").header("Authorization", "Bearer " + vale)).andExpect(status().isNoContent());
        mvc.perform(get("/api/users/" + valeId + "/avatar").header("Authorization", "Bearer " + marco)).andExpect(status().isNotFound());
    }

    @Test
    void ilFileDeveEssereUnImmagine() throws Exception {
        String vale = TestUsers.register(mvc, "Vale");
        mvc.perform(multipart(HttpMethod.PUT, "/api/me/avatar").file(new MockMultipartFile("file", "a.png", "image/png", "testo".getBytes()))
                .header("Authorization", "Bearer " + vale))
                .andExpect(status().isBadRequest());
    }
}
