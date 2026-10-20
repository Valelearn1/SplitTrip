package com.splittrip.auth.reset;

import org.springframework.http.MediaType;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

/**
 * Email di ripristino con l'API HTTP di Brevo (D-61): passa da HTTPS, quindi nessuna porta SMTP da aprire sull'hosting.
 * La chiave sta solo in BREVO_API_KEY; testo semplice in italiano con una formula neutra.
 */
class BrevoApiPasswordResetMailer implements PasswordResetMailer {

    static final String SUBJECT = "Reimposta la password di SplitTrip";
    private final RestClient client;
    private final String from;

    BrevoApiPasswordResetMailer(RestClient.Builder builder, String apiKey, String from) {
        this.client = builder.baseUrl("https://api.brevo.com/v3").defaultHeader("api-key", apiKey).build();
        this.from = from;
    }

    @Override
    public void send(String to, String link) {
        client.post().uri("/smtp/email").contentType(MediaType.APPLICATION_JSON)
                .body(Map.of(
                        "sender", Map.of("name", "SplitTrip", "email", from),
                        "to", List.of(Map.of("email", to)),
                        "subject", SUBJECT,
                        "textContent", text(link)))
                .retrieve().toBodilessEntity();
    }

    static String text(String link) {
        return """
                Ciao,

                hai chiesto di reimpostare la password di SplitTrip. Apri questo link entro 30 minuti:

                %s

                Se non l'hai chiesto tu, ignora questa email: la password resta quella di prima.

                SplitTrip · Dividete le spese, non le amicizie.
                """.formatted(link);
    }
}
