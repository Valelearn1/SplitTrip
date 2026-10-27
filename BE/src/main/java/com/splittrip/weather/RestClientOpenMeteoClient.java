package com.splittrip.weather;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/** Client HTTP di Open-Meteo. Il timeout lo imposta WeatherConfig sul builder (così i test possono usare un server finto). */
public class RestClientOpenMeteoClient implements OpenMeteoClient {

    record GeoResult(BigDecimal latitude, BigDecimal longitude) {}
    record GeoResponse(List<GeoResult> results) {}
    record Daily(List<LocalDate> time,
                 @JsonProperty("weather_code") List<Integer> weatherCode,
                 @JsonProperty("temperature_2m_max") List<BigDecimal> tMax,
                 @JsonProperty("temperature_2m_min") List<BigDecimal> tMin) {}
    record ForecastResponse(Daily daily) {}

    private final RestClient rest;

    public RestClientOpenMeteoClient(RestClient.Builder builder) {
        this.rest = builder.build();
    }

    @Override
    public Optional<Coordinates> geocode(String place) {
        GeoResponse r = rest.get()
                .uri("https://geocoding-api.open-meteo.com/v1/search?name={name}&count=1&language=it", place)
                .retrieve().body(GeoResponse.class);
        if (r == null || r.results() == null || r.results().isEmpty()) return Optional.empty();
        GeoResult first = r.results().getFirst();
        return Optional.of(new Coordinates(first.latitude(), first.longitude()));
    }

    @Override
    public List<DayForecast> forecast(BigDecimal latitude, BigDecimal longitude) {
        ForecastResponse r = rest.get()
                .uri("https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}"
                        + "&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=16", latitude, longitude)
                .retrieve().body(ForecastResponse.class);
        if (r == null || r.daily() == null || r.daily().time() == null) return List.of();
        Daily d = r.daily();
        List<DayForecast> out = new ArrayList<>();
        for (int i = 0; i < d.time().size(); i++) {
            Integer code = d.weatherCode().get(i);
            BigDecimal tMin = d.tMin().get(i);
            BigDecimal tMax = d.tMax().get(i);
            // L'ultimo dei 16 giorni a volte arriva con tutti null (previsione non ancora calcolata): si salta
            if (code == null || tMin == null || tMax == null) continue;
            out.add(new DayForecast(d.time().get(i), code, tMin, tMax));
        }
        return out;
    }
}
