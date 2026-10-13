package com.splittrip.trip.dto;

import java.time.LocalDate;

public record JoinPreviewResponse(String name, String destination, LocalDate startDate, LocalDate endDate, long memberCount) {}
