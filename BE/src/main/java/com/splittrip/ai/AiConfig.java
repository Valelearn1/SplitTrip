package com.splittrip.ai;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

import java.net.http.HttpClient;
import java.time.Duration;

@Configuration
public class AiConfig {

    /** Senza chiave il client è disattivato; con la chiave, timeout di 15 s (D-41). */
    @Bean
    AiClient aiClient(AiProperties props) {
        if (props.apiKey() == null || props.apiKey().isBlank()) return new DisabledAiClient();
        var factory = new JdkClientHttpRequestFactory(HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build());
        factory.setReadTimeout(Duration.ofSeconds(15));
        return new AnthropicAiClient(RestClient.builder().requestFactory(factory), props.apiKey(), props.model());
    }
}
