package com.splittrip.ai;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.List;

import static org.springframework.http.MediaType.APPLICATION_JSON;

/** Messages API di Anthropic. Il timeout lo imposta AiConfig sul builder; la chiave non va mai nei log. */
public class AnthropicAiClient implements AiClient {

    record Message(String role, String content) {}
    record Request(String model, @JsonProperty("max_tokens") int maxTokens, String system, List<Message> messages) {}
    record Block(String type, String text) {}
    record Response(List<Block> content) {}

    private final RestClient rest;
    private final String apiKey;
    private final String model;

    public AnthropicAiClient(RestClient.Builder builder, String apiKey, String model) {
        this.rest = builder.build();
        this.apiKey = apiKey;
        this.model = model;
    }

    @Override public boolean available() { return true; }

    @Override
    public String complete(String system, String user) {
        Response r;
        try {
            r = rest.post().uri("https://api.anthropic.com/v1/messages")
                    .header("x-api-key", apiKey)
                    .header("anthropic-version", "2023-06-01")
                    .contentType(APPLICATION_JSON)
                    .body(new Request(model, 1024, system, List.of(new Message("user", user))))
                    .retrieve().body(Response.class);
        } catch (RestClientException e) {
            throw new AiUnavailableException("Servizio AI non raggiungibile: " + e.getClass().getSimpleName());
        }
        if (r == null || r.content() == null) throw new AiUnavailableException("Risposta vuota");
        return r.content().stream().filter(b -> "text".equals(b.type()) && b.text() != null).map(Block::text).findFirst()
                .orElseThrow(() -> new AiUnavailableException("Risposta senza testo"));
    }
}
