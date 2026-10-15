package com.splittrip.home.dto;

import com.splittrip.notification.dto.NotificationResponse;
import com.splittrip.trip.dto.TripSummaryResponse;
import com.splittrip.weather.OpenMeteoClient.DayForecast;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record HomeResponse(Featured featured, List<TripBalance> balances, Totals totals,
                           List<NotificationResponse> latestNotifications, Trips trips) {
    public record Featured(TripSummaryResponse trip, String status /* ONGOING|UPCOMING|ENDED|PAST */, Integer daysUntil, Integer dayOfTotal, Integer totalDays,
                           UUID coverPhotoId, DayForecast weatherToday, BigDecimal myNet) {}
    public record TripBalance(UUID tripId, String tripName, String currency, BigDecimal myNet) {}
    public record Totals(BigDecimal toReceive, BigDecimal toGive, int tripsToReceive, int tripsToGive) {}
    public record Trips(List<TripSummaryResponse> current, List<TripSummaryResponse> past) {}
}
