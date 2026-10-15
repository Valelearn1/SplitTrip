package com.splittrip.home;

import com.splittrip.expense.BalanceService;
import com.splittrip.home.dto.HomeResponse;
import com.splittrip.home.dto.HomeResponse.*;
import com.splittrip.notification.NotificationRepository;
import com.splittrip.notification.dto.NotificationResponse;
import com.splittrip.photo.PhotoRepository;
import com.splittrip.trip.ParticipantRepository;
import com.splittrip.trip.TripService;
import com.splittrip.trip.TripStatus;
import com.splittrip.trip.dto.TripSummaryResponse;
import com.splittrip.weather.OpenMeteoClient.DayForecast;
import com.splittrip.weather.WeatherService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/** La Home in una chiamata (D-49): viaggio in evidenza, i miei saldi, le ultime novità, l'elenco. */
@Service
public class HomeService {

    private final TripService trips;
    private final ParticipantRepository participants;
    private final BalanceService balances;
    private final WeatherService weather;
    private final PhotoRepository photos;
    private final NotificationRepository notifications;
    private final Clock clock;

    public HomeService(TripService trips, ParticipantRepository participants, BalanceService balances, WeatherService weather,
                       PhotoRepository photos, NotificationRepository notifications, Clock clock) {
        this.trips = trips;
        this.participants = participants;
        this.balances = balances;
        this.weather = weather;
        this.photos = photos;
        this.notifications = notifications;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public HomeResponse home(UUID userId) {
        LocalDate today = LocalDate.now(clock);
        List<TripSummaryResponse> all = trips.listForUser(userId);
        List<TripSummaryResponse> current = all.stream().filter(t -> t.status() != TripStatus.CLOSED).toList();
        List<TripSummaryResponse> past = all.stream().filter(t -> t.status() == TripStatus.CLOSED).toList();

        List<TripBalance> myBalances = new ArrayList<>();
        BigDecimal toReceive = BigDecimal.ZERO, toGive = BigDecimal.ZERO;
        int tripsToReceive = 0, tripsToGive = 0;
        for (TripSummaryResponse t : current) {
            BigDecimal net = myNet(t.id(), userId);
            if (net.signum() == 0) continue;
            myBalances.add(new TripBalance(t.id(), t.name(), t.currency(), net));
            if (net.signum() > 0) { toReceive = toReceive.add(net); tripsToReceive++; } else { toGive = toGive.add(net.negate()); tripsToGive++; }
        }

        Featured featured = pick(current, past, today).map(t -> featured(t, userId, today)).orElse(null);
        List<NotificationResponse> latest = notifications.findTop3ByUserIdOrderByCreatedAtDesc(userId).stream().map(NotificationResponse::from).toList();
        return new HomeResponse(featured, myBalances, new Totals(toReceive.setScale(2), toGive.setScale(2), tripsToReceive, tripsToGive), latest, new Trips(current, past));
    }

    /** In corso con la fine più vicina; altrimenti il prossimo in pianificazione; altrimenti l'ultimo chiuso. */
    static Optional<TripSummaryResponse> pick(List<TripSummaryResponse> current, List<TripSummaryResponse> past, LocalDate today) {
        Optional<TripSummaryResponse> ongoing = current.stream().filter(t -> t.status() == TripStatus.ONGOING).min(Comparator.comparing(TripSummaryResponse::endDate));
        if (ongoing.isPresent()) return ongoing;
        Optional<TripSummaryResponse> upcoming = current.stream().filter(t -> !t.endDate().isBefore(today)).min(Comparator.comparing(TripSummaryResponse::startDate));
        if (upcoming.isPresent()) return upcoming;
        Optional<TripSummaryResponse> anyPlanning = current.stream().min(Comparator.comparing(TripSummaryResponse::startDate));
        if (anyPlanning.isPresent()) return anyPlanning;
        return past.stream().max(Comparator.comparing(TripSummaryResponse::endDate));
    }

    private Featured featured(TripSummaryResponse t, UUID userId, LocalDate today) {
        int totalDays = (int) ChronoUnit.DAYS.between(t.startDate(), t.endDate()) + 1;
        String status = t.status() == TripStatus.CLOSED ? "PAST" : t.status() == TripStatus.ONGOING ? "ONGOING" : "UPCOMING";
        Integer daysUntil = status.equals("UPCOMING") ? (int) Math.max(0, ChronoUnit.DAYS.between(today, t.startDate())) : null;
        Integer dayOfTotal = status.equals("ONGOING") ? (int) Math.clamp(ChronoUnit.DAYS.between(t.startDate(), today) + 1, 1, totalDays) : null;
        DayForecast todayForecast = status.equals("PAST") ? null
                : weather.forecast(t.id(), userId).stream().filter(d -> d.date().equals(today)).findFirst().orElse(null);
        return new Featured(t, status, daysUntil, dayOfTotal, totalDays, photos.findLatestPhotoId(t.id()).orElse(null), todayForecast, myNet(t.id(), userId));
    }

    private BigDecimal myNet(UUID tripId, UUID userId) {
        return participants.findByTripIdAndUserIdAndLeftAtIsNull(tripId, userId)
                .flatMap(me -> balances.computeBalances(tripId).balances().stream().filter(b -> b.participantId().equals(me.getId())).findFirst())
                .map(b -> b.net()).orElse(BigDecimal.ZERO).setScale(2);
    }
}
