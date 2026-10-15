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
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.queryParam;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

class PhotonPlaceClientTest {

    RestClient.Builder builder = RestClient.builder();
    MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
    PhotonPlaceClient client = new PhotonPlaceClient(builder);

    @Test
    void cercaInItalianoVicinoAUnPuntoELeggeNomeEDettaglio() {
        server.expect(requestTo(startsWith("https://photon.komoot.io/api")))
                .andExpect(queryParam("q", "Rua%20Augusta%20%26%20Caf%C3%A9%20%E2%98%95")) // Review Focus 1: caratteri speciali codificati
                .andExpect(queryParam("lang", "it")).andExpect(queryParam("limit", "6"))
                .andExpect(queryParam("lat", "38.72")).andExpect(queryParam("lon", "-9.14"))
                .andExpect(header("User-Agent", "SplitTrip (capstone)"))
                .andRespond(withSuccess("""
                        {"features":[
                          {"geometry":{"coordinates":[-9.1372,38.7102]},"properties":{"name":"Rua Augusta","city":"Lisbona","country":"Portogallo"}},
                          {"geometry":{"coordinates":[-9.1297,38.7128]},"properties":{"name":"Belvedere di Santa Luzia","district":"Alfama","city":"Lisbona","country":"Portogallo"}},
                          {"geometry":{"coordinates":[-9.14,38.72]},"properties":{"city":"Lisbona","country":"Portogallo"}}
                        ]}
                        """, APPLICATION_JSON));
        List<Place> found = client.search("Rua Augusta & Café ☕", new BigDecimal("38.72"), new BigDecimal("-9.14"));
        assertThat(found).hasSize(3);
        assertThat(found.get(0).name()).isEqualTo("Rua Augusta");
        assertThat(found.get(0).detail()).isEqualTo("Lisbona, Portogallo");
        assertThat(found.get(0).latitude()).isEqualByComparingTo("38.7102");
        assertThat(found.get(1).detail()).isEqualTo("Alfama, Lisbona, Portogallo");
        assertThat(found.get(2).name()).isEqualTo("Lisbona"); // senza name: la città fa da nome
        assertThat(found.get(2).detail()).isEqualTo("Portogallo");
    }

    @Test
    void senzaPuntoVicinoNonMandaLatLon() {
        server.expect(requestTo(startsWith("https://photon.komoot.io/api")))
                .andExpect(queryParam("q", "Lisbona"))
                .andRespond(withSuccess("{\"features\":[]}", APPLICATION_JSON));
        assertThat(client.search("Lisbona", null, null)).isEmpty();
    }
}
