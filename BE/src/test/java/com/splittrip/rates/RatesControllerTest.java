package com.splittrip.rates;

import com.splittrip.IntegrationTest;
import com.splittrip.TestUsers;
import org.junit.jupiter.api.Test;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class RatesControllerTest extends IntegrationTest {

    @MockitoBean RatesClient rates;   // niente rete nei test

    @Test
    void cambioSoloPerChiHaFattoLAccessoCon404E503Chiari() throws Exception {
        when(rates.rate(eq(LocalDate.of(2026, 10, 20)), eq("JPY"), eq("EUR")))
                .thenReturn(Optional.of(new RatesClient.Quote(new BigDecimal("0.00562366"), LocalDate.of(2026, 10, 16))));
        when(rates.rate(any(), eq("MAD"), any())).thenReturn(Optional.empty());
        when(rates.rate(any(), eq("CHF"), any())).thenThrow(new RuntimeException("timeout"));
        String vale = TestUsers.register(mvc, "Vale");

        mvc.perform(get("/api/rates?from=JPY&to=EUR&date=2026-10-20")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/rates?from=JPY&to=EUR&date=2026-10-20").header("Authorization", "Bearer " + vale))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.rate").value(0.00562366))
                .andExpect(jsonPath("$.date").value("2026-10-16"));
        mvc.perform(get("/api/rates?from=MAD&to=EUR&date=2026-10-20").header("Authorization", "Bearer " + vale))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.detail").value("Cambio non disponibile per MAD: scrivilo a mano"));
        mvc.perform(get("/api/rates?from=CHF&to=EUR&date=2026-10-20").header("Authorization", "Bearer " + vale))
                .andExpect(status().isServiceUnavailable());
        mvc.perform(get("/api/rates?from=JPY&to=EUR&date=20-10-2026").header("Authorization", "Bearer " + vale))
                .andExpect(status().isBadRequest());
    }
}
