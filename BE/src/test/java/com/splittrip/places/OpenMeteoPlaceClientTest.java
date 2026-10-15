package com.splittrip.places;

import com.splittrip.places.dto.Place;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.startsWith;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.queryParam;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

class OpenMeteoPlaceClientTest {

    RestClient.Builder builder = RestClient.builder();
    MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
    OpenMeteoPlaceClient client = new OpenMeteoPlaceClient(builder);

    static final String LISBONA_E_ALTRI = """
            {"results":[
              {"name":"Lisbona","latitude":38.71667,"longitude":-9.13333,"admin1":"Distretto di Lisbona","admin2":"Lisbon","country":"Portogallo"},
              {"name":"Madeira","latitude":32.75,"longitude":-17.0,"admin1":"Madeira","country":"Portogallo"},
              {"name":"Lis","latitude":41.69,"longitude":20.24,"admin1":"Qarku i Dibrës","country":"Albania"},
              {"name":"Alfama","latitude":38.7117,"longitude":-9.1303,"admin1":"Distretto di Lisbona","admin2":"Lisbon","country":"Portogallo"}
            ]}
            """;

    @Test
    void cercaInItalianoELeggeNomeEDettaglio() {
        server.expect(requestTo(startsWith("https://geocoding-api.open-meteo.com/v1/search")))
                .andExpect(queryParam("name", "Rua%20Augusta%20%26%20Caf%C3%A9%20%E2%98%95")) // Review Focus 1: caratteri speciali codificati
                .andExpect(queryParam("language", "it")).andExpect(queryParam("count", "10"))
                .andRespond(withSuccess(LISBONA_E_ALTRI, APPLICATION_JSON));
        List<Place> found = client.search("Rua Augusta & Café ☕", null, null);
        assertThat(found).extracting(Place::name).containsExactly("Lisbona", "Madeira", "Lis", "Alfama"); // senza «vicino a»: l'ordine del servizio
        assertThat(found.get(0).detail()).isEqualTo("Distretto di Lisbona, Portogallo");     // regione (tradotta) e paese
        assertThat(found.get(1).detail()).isEqualTo("Portogallo");                           // regione uguale al nome: non si ripete
        assertThat(found.get(2).detail()).isEqualTo("Qarku i Dibrës, Albania");
        assertThat(found.get(3).detail()).isEqualTo("Distretto di Lisbona, Portogallo");     // admin2 spesso non è tradotto: si usa la regione
        assertThat(found.get(0).latitude()).isEqualByComparingTo("38.71667");
    }

    @Test
    void conUnPuntoVicinoMetteIPiuViciniPrimaEnonSuperaSei() {
        StringBuilder many = new StringBuilder("{\"results\":[");
        for (int i = 0; i < 9; i++) many.append("{\"name\":\"Lontano ").append(i).append("\",\"latitude\":").append(10 + i).append(",\"longitude\":10,\"country\":\"X\"},");
        many.append("{\"name\":\"Vicino\",\"latitude\":38.71,\"longitude\":-9.14,\"country\":\"Portogallo\"}]}");
        server.expect(requestTo(startsWith("https://geocoding-api.open-meteo.com/v1/search")))
                .andRespond(withSuccess(many.toString(), APPLICATION_JSON));
        List<Place> found = client.search("luogo", new BigDecimal("38.72"), new BigDecimal("-9.14"));
        assertThat(found).hasSize(6);
        assertThat(found.getFirst().name()).isEqualTo("Vicino");
    }

    @Test
    void nessunRisultatoDaListaVuota() {
        server.expect(requestTo(startsWith("https://geocoding-api.open-meteo.com/v1/search")))
                .andRespond(withSuccess("{\"generationtime_ms\":0.5}", APPLICATION_JSON));
        assertThat(client.search("zzzzz", null, null)).isEmpty();
    }
}
