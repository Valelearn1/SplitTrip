package com.splittrip.weather;

import com.splittrip.auth.CurrentUserId;
import com.splittrip.weather.dto.WeatherResponse;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
public class WeatherController {

    private final WeatherService service;

    public WeatherController(WeatherService service) { this.service = service; }

    @GetMapping("/api/trips/{tripId}/weather")
    @Operation(summary = "Previsioni (Open-Meteo) per i giorni del viaggio; vuoto se non disponibili")
    public WeatherResponse weather(@CurrentUserId UUID userId, @PathVariable UUID tripId) {
        return new WeatherResponse(service.forecast(tripId, userId));
    }
}
