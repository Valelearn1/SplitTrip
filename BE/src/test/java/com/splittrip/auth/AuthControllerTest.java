package com.splittrip.auth;

import com.splittrip.IntegrationTest;
import com.splittrip.TestUsers;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AuthControllerTest extends IntegrationTest {

    @Test
    void registrazioneLoginEMe() throws Exception {
        String email = "vale-" + UUID.randomUUID() + "@example.com";
        mvc.perform(post("/api/auth/register").contentType(APPLICATION_JSON).content("""
                {"email":"%s","password":"password1","displayName":"Vale"}
                """.formatted(email)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.user.email").value(email))
                .andExpect(jsonPath("$.user.displayName").value("Vale"));

        String login = mvc.perform(post("/api/auth/login").contentType(APPLICATION_JSON).content("""
                {"email":"%s","password":"password1"}
                """.formatted(email)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        String token = TestUsers.extract(login, "\"token\":\"([^\"]+)\"");

        mvc.perform(get("/api/me").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(email));
    }

    @Test
    void passwordDeboleDa400ConErrori() throws Exception {
        mvc.perform(post("/api/auth/register").contentType(APPLICATION_JSON).content("""
                {"email":"x@example.com","password":"corta","displayName":"Xavier"}
                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("Validazione fallita"))
                .andExpect(jsonPath("$.errors[0].field").value("password"));
    }

    @Test
    void tokenManomessoDa401() throws Exception {
        String token = TestUsers.register(mvc, "Marco");
        mvc.perform(get("/api/me").header("Authorization", "Bearer " + token + "x"))
                .andExpect(status().isUnauthorized());
    }
}
