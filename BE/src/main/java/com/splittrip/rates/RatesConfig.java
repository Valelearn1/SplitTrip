package com.splittrip.rates;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

import java.net.http.HttpClient;
import java.time.Duration;

@Configuration
public class RatesConfig {

    /** Timeout di 3 s: un cambio lento non deve bloccare il modulo (si scrive a mano). */
    @Bean
    RatesClient ratesClient() {
        var factory = new JdkClientHttpRequestFactory(HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(3)).build());
        factory.setReadTimeout(Duration.ofSeconds(3));
        return new FrankfurterRatesClient(RestClient.builder().requestFactory(factory));
    }
}
