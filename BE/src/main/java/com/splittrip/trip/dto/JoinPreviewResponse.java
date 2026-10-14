package com.splittrip.trip.dto;

import java.time.LocalDate;
import java.util.List;

public record JoinPreviewResponse(String name, String destination, LocalDate startDate, LocalDate endDate,
                                  long memberCount, List<UnclaimedParticipant> unclaimed) {}
