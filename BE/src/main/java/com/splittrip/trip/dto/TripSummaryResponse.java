package com.splittrip.trip.dto;

import com.splittrip.trip.MemberRole;
import com.splittrip.trip.TripStatus;

import java.time.LocalDate;
import java.util.UUID;

public record TripSummaryResponse(UUID id, String name, String destination, LocalDate startDate, LocalDate endDate,
                                  String currency, TripStatus status, long memberCount, MemberRole myRole) {}
