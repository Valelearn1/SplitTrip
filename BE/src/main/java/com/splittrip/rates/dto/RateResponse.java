package com.splittrip.rates.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

/** Cambio da→a (quanto vale 1 unità di «da» in «a») e la data del tasso BCE usato. */
public record RateResponse(BigDecimal rate, LocalDate date) {}
