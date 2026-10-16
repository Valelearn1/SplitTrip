package com.splittrip.auth;

import com.splittrip.IntegrationTest;
import com.splittrip.auth.reset.PasswordResetMailer;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Password dimenticata (D-61): link monouso via email, risposta sempre uguale, token salvato solo come hash. */
class PasswordResetControllerTest extends IntegrationTest {

    @MockitoBean PasswordResetMailer mailer;
    @Autowired JdbcTemplate jdbc;

    String register(String name) throws Exception {
        String email = name.toLowerCase() + "-" + UUID.randomUUID() + "@example.com";
        mvc.perform(post("/api/auth/register").contentType(APPLICATION_JSON).content("""
                {"email":"%s","password":"password1","displayName":"%s"}
                """.formatted(email, name))).andExpect(status().isCreated());
        return email;
    }

    void request(String email) throws Exception {
        mvc.perform(post("/api/auth/password-reset/request").contentType(APPLICATION_JSON).content("{\"email\":\"%s\"}".formatted(email)))
                .andExpect(status().isNoContent());
    }

    /** Il token dell'ultimo link spedito a quell'indirizzo. */
    String lastToken(String email, int sent) {
        ArgumentCaptor<String> link = ArgumentCaptor.forClass(String.class);
        verify(mailer, times(sent)).send(eq(email), link.capture());
        assertThat(link.getValue()).startsWith("http://localhost:5173/reimposta-password?token=");
        return link.getValue().substring(link.getValue().indexOf("token=") + 6);
    }

    org.springframework.test.web.servlet.ResultActions confirm(String token, String password) throws Exception {
        return mvc.perform(post("/api/auth/password-reset/confirm").contentType(APPLICATION_JSON)
                .content("{\"token\":\"%s\",\"newPassword\":\"%s\"}".formatted(token, password)));
    }

    void login(String email, String password, int expected) throws Exception {
        mvc.perform(post("/api/auth/login").contentType(APPLICATION_JSON).content("{\"email\":\"%s\",\"password\":\"%s\"}".formatted(email, password)))
                .andExpect(status().is(expected));
    }

    @Test
    void emailSconosciutaDa204ESenzaEmail() throws Exception {
        request("nessuno-" + UUID.randomUUID() + "@example.com");
        verifyNoInteractions(mailer);
    }

    @Test
    void emailNotaDa204EUnLinkCheFunzionaUnaVolta() throws Exception {
        String email = register("Vale");
        request(email);
        String token = lastToken(email, 1);
        confirm(token, "nuova1234").andExpect(status().isNoContent());
        login(email, "password1", 401);
        login(email, "nuova1234", 200);
        confirm(token, "altra5678").andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Link non valido o scaduto"));
    }

    @Test
    void laSecondaRichiestaAnnullaLaPrima() throws Exception {                                   // Review Focus 2
        String email = register("Vale");
        request(email);
        String first = lastToken(email, 1);
        request(email);
        String second = lastToken(email, 2);
        confirm(first, "nuova1234").andExpect(status().isBadRequest());
        confirm(second, "nuova1234").andExpect(status().isNoContent());
    }

    @Test
    void emailNormalizzataComeAlLogin() throws Exception {                                     // Review Focus 3
        String email = register("Vale");
        request("  " + email.toUpperCase() + " ");
        lastToken(email, 1);
    }

    @Test
    void tokenScadutoDa400() throws Exception {
        String email = register("Vale");
        request(email);
        String token = lastToken(email, 1);
        jdbc.update("update password_reset_tokens set expires_at = now() - interval '1 minute'");
        confirm(token, "nuova1234").andExpect(status().isBadRequest()).andExpect(jsonPath("$.detail").value("Link non valido o scaduto"));
    }

    @Test
    void tokenInventatoDa400() throws Exception {
        confirm("inventato", "nuova1234").andExpect(status().isBadRequest()).andExpect(jsonPath("$.detail").value("Link non valido o scaduto"));
    }

    @Test
    void passwordDeboleDa400SulCampo() throws Exception {
        String email = register("Vale");
        request(email);
        confirm(lastToken(email, 1), "corta").andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors[0].field").value("newPassword"));
    }

    @Test
    void ilTokenInChiaroNonSiSalva() throws Exception {
        String email = register("Vale");
        request(email);
        String token = lastToken(email, 1);
        assertThat(jdbc.queryForObject("select count(*) from password_reset_tokens where token_hash = ?", Long.class, token)).isZero();
        assertThat(jdbc.queryForObject("select count(*) from password_reset_tokens where length(token_hash) = 64", Long.class)).isPositive();
    }
}
