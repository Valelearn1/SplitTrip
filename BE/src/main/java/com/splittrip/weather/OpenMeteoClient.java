package com.splittrip.weather;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/** Open-Meteo: geocoding e previsioni, gratuiti e senza chiave (D-37). */
public interface OpenMeteoClient {

    record Coordinates(BigDecimal latitude, BigDecimal longitude) {}

    /** code: codice meteo WMO (0 sereno, 61 pioggia…). */
    record DayForecast(LocalDate date, int code, BigDecimal tMin, BigDecimal tMax) {}

    Optional<Coordinates> geocode(String place);

    List<DayForecast> forecast(BigDecimal latitude, BigDecimal longitude);
}
