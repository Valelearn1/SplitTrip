package com.splittrip.rates;

import com.splittrip.auth.CurrentUserId;
import com.splittrip.rates.dto.RateResponse;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/api/rates")
public class RatesController {

    private final RatesService service;

    public RatesController(RatesService service) { this.service = service; }

    @GetMapping
    @Operation(summary = "Cambio BCE del giorno da una valuta a un'altra (quanto vale 1 unità di from in to); 404 se la valuta non è nella lista, 503 se il servizio è giù")
    public RateResponse rate(@CurrentUserId UUID userId, @RequestParam String from, @RequestParam String to,
                             @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return service.rate(date, from, to);
    }
}
