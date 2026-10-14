package com.splittrip.photo;

import com.splittrip.IntegrationTest;
import com.splittrip.TestTrips;
import com.splittrip.TestUsers;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;

import java.util.UUID;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = "app.photos.max-per-trip=2")
class PhotoLimitTest extends IntegrationTest {

    @Test
    void oltreIlLimiteDa409() throws Exception {
        String vale = TestUsers.register(mvc, "Vale");
        UUID tripId = TestTrips.create(mvc, vale, "Roma");
        for (int i = 0; i < 2; i++) {
            mvc.perform(multipart("/api/trips/" + tripId + "/photos").file(new MockMultipartFile("file", "f.jpg", "image/jpeg", PhotoControllerTest.jpeg(100, 100)))
                    .header("Authorization", "Bearer " + vale)).andExpect(status().isCreated());
        }
        mvc.perform(multipart("/api/trips/" + tripId + "/photos").file(new MockMultipartFile("file", "f.jpg", "image/jpeg", PhotoControllerTest.jpeg(100, 100)))
                .header("Authorization", "Bearer " + vale))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.detail").value(containsString("limite di 2 foto")));
    }
}
