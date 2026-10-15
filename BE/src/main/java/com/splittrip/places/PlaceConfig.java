package com.splittrip.places;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

import java.net.http.HttpClient;
import java.time.Duration;

@Configuration
public class PlaceConfig {

    /** Timeout di 3 s: una ricerca lenta non deve bloccare il form. */
    @Bean
    PlaceSearchClient placeSearchClient() {
        var factory = new JdkClientHttpRequestFactory(HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(3)).build());
        factory.setReadTimeout(Duration.ofSeconds(3));
        return new PhotonPlaceClient(RestClient.builder().requestFactory(factory));
    }
}
