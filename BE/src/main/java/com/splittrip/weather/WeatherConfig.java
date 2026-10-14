package com.splittrip.weather;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

import java.net.http.HttpClient;
import java.time.Duration;

@Configuration
public class WeatherConfig {

    /** Timeout di 3 s: il meteo non deve mai rallentare la panoramica. */
    @Bean
    OpenMeteoClient openMeteoClient() {
        var factory = new JdkClientHttpRequestFactory(HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(3)).build());
        factory.setReadTimeout(Duration.ofSeconds(3));
        // Boot 4 non espone un RestClient.Builder senza il modulo restclient: lo costruiamo qui
        return new RestClientOpenMeteoClient(RestClient.builder().requestFactory(factory));
    }
}
