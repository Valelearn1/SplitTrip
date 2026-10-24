package com.splittrip.auth;

import com.splittrip.IntegrationTest;
import com.splittrip.TestUsers;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;

import java.time.Instant;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AuthControllerTest extends IntegrationTest {

    @Autowired JdbcTemplate jdbc;

    @Test
    void registrazioneLoginEMe() throws Exception {
        String email = "vale-" + UUID.randomUUID() + "@example.com";
        mvc.perform(post("/api/auth/register").contentType(APPLICATION_JSON).content("""
                {"email":"%s","password":"password1","displayName":"Vale","acceptedTerms":true}
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
                {"email":"x@example.com","password":"corta","displayName":"Xavier","acceptedTerms":true}
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

    /** D-73: senza la spunta su «Accetto i Termini e condizioni» non ci si registra, nemmeno chiamando l'API a mano. */
    @ParameterizedTest
    @ValueSource(strings = {"", ",\"acceptedTerms\":false", ",\"acceptedTerms\":null"})
    void senzaAccettareITerminiNonCiSiRegistra(String accepted) throws Exception {
        String email = "senza-" + UUID.randomUUID() + "@example.com";
        mvc.perform(post("/api/auth/register").contentType(APPLICATION_JSON).content("""
                {"email":"%s","password":"password1","displayName":"Vale"%s}
                """.formatted(email, accepted)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors[0].field").value("acceptedTerms"))
                .andExpect(jsonPath("$.errors[0].message").value("Per registrarti accetta i Termini e condizioni"));
        assertThat(jdbc.queryForObject("SELECT count(*) FROM users WHERE email = ?", Integer.class, email)).isZero();
    }

    @Test
    void laRegistrazioneSalvaQuandoSonoStatiAccettatiITermini() throws Exception {
        Instant before = Instant.now().minusSeconds(5);
        String email = "accetta-" + UUID.randomUUID() + "@example.com";
        mvc.perform(post("/api/auth/register").contentType(APPLICATION_JSON).content("""
                {"email":"%s","password":"password1","displayName":"Vale","acceptedTerms":true}
                """.formatted(email)))
                .andExpect(status().isCreated());
        Instant accepted = jdbc.queryForObject("SELECT terms_accepted_at FROM users WHERE email = ?", Instant.class, email);
        assertThat(accepted).isAfter(before);
    }
}
