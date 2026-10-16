package com.splittrip.auth.reset;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.jsonPath;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;

/** L'email di ripristino via API HTTP di Brevo (D-61): una POST con la chiave nell'header e il messaggio in JSON. */
class BrevoApiPasswordResetMailerTest {

    final RestClient.Builder builder = RestClient.builder();
    final MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
    final BrevoApiPasswordResetMailer mailer = new BrevoApiPasswordResetMailer(builder, "chiave-di-prova", "splittrip@example.com");

    @Test
    void speditaConChiaveMittenteDestinatarioELink() {
        server.expect(requestTo("https://api.brevo.com/v3/smtp/email"))
                .andExpect(method(HttpMethod.POST))
                .andExpect(header("api-key", "chiave-di-prova"))
                .andExpect(jsonPath("$.sender.name").value("SplitTrip"))
                .andExpect(jsonPath("$.sender.email").value("splittrip@example.com"))
                .andExpect(jsonPath("$.to[0].email").value("vale@example.com"))
                .andExpect(jsonPath("$.subject").value("Reimposta la password di SplitTrip"))
                .andExpect(jsonPath("$.textContent").value(containsString("https://splittrip.test/reimposta-password?token=abc")))
                .andExpect(jsonPath("$.textContent").value(containsString("Se non l'hai chiesto tu")))
                .andRespond(withStatus(HttpStatus.CREATED));
        mailer.send("vale@example.com", "https://splittrip.test/reimposta-password?token=abc");
        server.verify();
    }

    @Test
    void unRifiutoDiBrevoArrivaComeEccezione() {        // il servizio la registra nel log senza il token e risponde comunque 204
        server.expect(requestTo("https://api.brevo.com/v3/smtp/email")).andRespond(withStatus(HttpStatus.UNAUTHORIZED));
        assertThatThrownBy(() -> mailer.send("vale@example.com", "https://splittrip.test/reimposta-password?token=abc"))
                .isInstanceOf(RestClientException.class);
    }
}
