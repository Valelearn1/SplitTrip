package com.splittrip.auth;

import com.splittrip.IntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.test.context.TestPropertySource;

import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@TestPropertySource(properties = "app.ratelimit.auth.max-requests=3")
class RateLimitIntegrationTest extends IntegrationTest {

    @Test
    void laQuartaRichiestaDiLoginDa429() throws Exception {
        String body = """
                {"email":"nessuno@example.com","password":"password1"}
                """;
        for (int i = 0; i < 3; i++) {
            mvc.perform(post("/api/auth/login").contentType(APPLICATION_JSON).content(body))
                    .andExpect(status().isUnauthorized());
        }
        mvc.perform(post("/api/auth/login").contentType(APPLICATION_JSON).content(body))
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.title").value("Troppe richieste"));
    }
}
