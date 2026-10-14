package com.splittrip.weather;

import org.junit.jupiter.api.Test;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.queryParam;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.hamcrest.Matchers.startsWith;

class RestClientOpenMeteoClientTest {

    RestClient.Builder builder = RestClient.builder();
    MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
    RestClientOpenMeteoClient client = new RestClientOpenMeteoClient(builder);

    @Test
    void geocodingEPrevisioniVengonoLette() {
        // MockRestServiceServer vuole tutte le aspettative prima delle chiamate
        server.expect(requestTo(startsWith("https://geocoding-api.open-meteo.com/v1/search"))).andExpect(queryParam("name", "Lisbona"))
                .andRespond(withSuccess("{\"results\":[{\"latitude\":38.7167,\"longitude\":-9.1333,\"name\":\"Lisbona\"}]}", APPLICATION_JSON));
        server.expect(requestTo(startsWith("https://api.open-meteo.com/v1/forecast")))
                .andRespond(withSuccess("""
                        {"daily":{"time":["2026-11-01","2026-11-02"],"weather_code":[3,61],"temperature_2m_max":[18.4,16.0],"temperature_2m_min":[11.2,10.5]}}
                        """, APPLICATION_JSON));

        var c = client.geocode("Lisbona").orElseThrow();
        assertThat(c.latitude()).isEqualByComparingTo("38.7167");
        var days = client.forecast(new BigDecimal("38.7167"), new BigDecimal("-9.1333"));
        assertThat(days).hasSize(2);
        assertThat(days.get(1).code()).isEqualTo(61);
        assertThat(days.get(1).tMax()).isEqualByComparingTo("16.0");
    }

    @Test
    void destinazioneSconosciutaDaVuoto() {
        server.expect(requestTo(startsWith("https://geocoding-api.open-meteo.com"))).andRespond(withSuccess("{}", APPLICATION_JSON));
        assertThat(client.geocode("Xyzzy")).isEmpty();
    }
}
