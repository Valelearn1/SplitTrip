package com.splittrip.weather.dto;

import com.splittrip.weather.OpenMeteoClient.DayForecast;

import java.util.List;

/** Previsioni per i giorni del viaggio nei prossimi 16; vuoto se la destinazione non si trova o il servizio non risponde. */
public record WeatherResponse(List<DayForecast> days) {}
