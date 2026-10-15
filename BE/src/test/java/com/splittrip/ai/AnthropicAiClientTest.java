package com.splittrip.ai;

import org.junit.jupiter.api.Test;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.http.HttpMethod.POST;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.jsonPath;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

class AnthropicAiClientTest {

    RestClient.Builder builder = RestClient.builder();
    MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
    AnthropicAiClient client = new AnthropicAiClient(builder, "sk-test-segreta", "claude-haiku-4-5");

    @Test
    void mandaChiaveVersioneEModelloELeggeIlTesto() {
        server.expect(requestTo("https://api.anthropic.com/v1/messages")).andExpect(method(POST))
                .andExpect(header("x-api-key", "sk-test-segreta"))
                .andExpect(header("anthropic-version", "2023-06-01"))
                .andExpect(jsonPath("$.model").value("claude-haiku-4-5"))
                .andExpect(jsonPath("$.system").value("sistema"))
                .andExpect(jsonPath("$.messages[0].role").value("user"))
                .andExpect(jsonPath("$.messages[0].content").value("utente"))
                .andRespond(withSuccess("{\"content\":[{\"type\":\"text\",\"text\":\"{\\\"tips\\\":[]}\"}]}", APPLICATION_JSON));
        assertThat(client.available()).isTrue();
        assertThat(client.complete("sistema", "utente")).isEqualTo("{\"tips\":[]}");
    }

    @Test
    void erroreDelServizioDiventaNonDisponibileSenzaRivelareLaChiave() {
        server.expect(requestTo("https://api.anthropic.com/v1/messages")).andRespond(withServerError());
        assertThatThrownBy(() -> client.complete("s", "u"))
                .isInstanceOf(AiUnavailableException.class)
                .hasMessage("Consigli non disponibili, riprova tra poco")
                .satisfies(e -> assertThat(e.toString()).doesNotContain("sk-test-segreta"));
    }

    @Test
    void senzaChiaveIlClientEDisattivato() {
        DisabledAiClient off = new DisabledAiClient();
        assertThat(off.available()).isFalse();
        assertThatThrownBy(() -> off.complete("s", "u")).isInstanceOf(AiUnavailableException.class);
    }
}
