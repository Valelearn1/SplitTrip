package com.splittrip.trip.dto;

import com.splittrip.trip.TripStatus;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record TripPatchRequest(
        @Size(min = 1, max = 80) String name,
        @Size(min = 1, max = 120) String destination,
        LocalDate startDate,
        LocalDate endDate,
        TripStatus status,
        BigDecimal latitude,
        BigDecimal longitude) {}
