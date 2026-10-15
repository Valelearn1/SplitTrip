package com.splittrip.ai;

import com.splittrip.ai.dto.AiTip;
import com.splittrip.ai.dto.AiTipsResponse;
import com.splittrip.ai.dto.PackingSuggestions;
import com.splittrip.common.AppException;
import com.splittrip.common.BadRequestException;
import com.splittrip.common.NotFoundException;
import com.splittrip.todo.TodoItem;
import com.splittrip.todo.TodoList;
import com.splittrip.todo.TodoListRepository;
import com.splittrip.todo.TodoListType;
import com.splittrip.trip.ParticipantRepository;
import com.splittrip.trip.Trip;
import com.splittrip.trip.TripAccessService;
import com.splittrip.trip.TripRepository;
import com.splittrip.weather.WeatherService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;

/** Consigli AI (D-41): 5 generazioni al giorno per viaggio; una generazione fallita non conta. */
@Service
public class AiService {

    static final int DAILY_LIMIT = 5;
    static final ZoneId ZONE = ZoneId.of("Europe/Rome");
    private static final Logger log = LoggerFactory.getLogger(AiService.class);

    private final AiClient ai;
    private final AiSuggestionRepository suggestions;
    private final TripRepository trips;
    private final ParticipantRepository participants;
    private final TodoListRepository lists;
    private final TripAccessService access;
    private final WeatherService weather;
    private final Clock clock;

    public AiService(AiClient ai, AiSuggestionRepository suggestions, TripRepository trips, ParticipantRepository participants,
                     TodoListRepository lists, TripAccessService access, WeatherService weather, Clock clock) {
        this.ai = ai;
        this.suggestions = suggestions;
        this.trips = trips;
        this.participants = participants;
        this.lists = lists;
        this.access = access;
        this.weather = weather;
        this.clock = clock;
    }

    public AiTipsResponse tips(UUID tripId, UUID userId) {
        access.requireMember(tripId, userId);
        var latest = suggestions.findFirstByTripIdAndKindOrderByCreatedAtDesc(tripId, AiSuggestionKind.TIPS);
        List<AiTip> tips = latest.map(s -> AiJson.parseTips(s.getContent())).orElse(List.of());
        return new AiTipsResponse(ai.available(), remaining(tripId), tips, latest.map(AiSuggestion::getCreatedAt).orElse(null));
    }

    public AiTipsResponse generateTips(UUID tripId, UUID userId) {
        Trip trip = prepare(tripId, userId);
        List<AiTip> tips = call(() -> AiJson.parseTips(ai.complete(AiPrompts.SYSTEM, AiPrompts.tipsUser(facts(trip, userId)))), tripId);
        AiSuggestion saved = suggestions.save(new AiSuggestion(trip, AiSuggestionKind.TIPS, AiJson.writeTips(tips), clock.instant()));
        return new AiTipsResponse(true, remaining(tripId), tips, saved.getCreatedAt());
    }

    public PackingSuggestions packing(UUID tripId, UUID listId, UUID userId) {
        Trip trip = prepare(tripId, userId);
        TodoList list = lists.findAllByTripIdWithItems(tripId).stream().filter(l -> l.getId().equals(listId)).findFirst()
                .orElseThrow(() -> new NotFoundException("Lista non trovata"));
        if (list.getType() != TodoListType.PACKING) throw new BadRequestException("I suggerimenti sono solo per le liste Valigia");
        List<String> existing = list.getItems().stream().map(TodoItem::getText).toList();
        List<String> items = call(() -> AiJson.parsePacking(ai.complete(AiPrompts.SYSTEM, AiPrompts.packingUser(facts(trip, userId), existing)), existing), tripId);
        suggestions.save(new AiSuggestion(trip, AiSuggestionKind.PACKING, String.join("\n", items), clock.instant()));
        return new PackingSuggestions(items, remaining(tripId));
    }

    private Trip prepare(UUID tripId, UUID userId) {
        access.requireMember(tripId, userId);
        Trip trip = trips.findById(tripId).orElseThrow();
        access.requireWritable(trip);
        if (!ai.available()) throw new AiUnavailableException("Chiave API assente");
        if (remaining(tripId) <= 0) throw new AppException(HttpStatus.TOO_MANY_REQUESTS, "Limite raggiunto", "Hai usato le 5 generazioni di oggi");
        return trip;
    }

    private <T> T call(java.util.function.Supplier<T> work, UUID tripId) {
        try {
            return work.get();
        } catch (AiUnavailableException e) {
            log.warn("Consigli AI non disponibili per il viaggio {}: {}", tripId, e.getReason());
            throw e;
        }
    }

    private AiPrompts.TripFacts facts(Trip trip, UUID userId) {
        int people = (int) participants.countByTripIdAndLeftAtIsNull(trip.getId());
        return new AiPrompts.TripFacts(trip.getDestination(), trip.getStartDate(), trip.getEndDate(), people, weather.forecast(trip.getId(), userId));
    }

    private int remaining(UUID tripId) {
        Instant since = LocalDate.now(clock.withZone(ZONE)).atStartOfDay(ZONE).toInstant();
        return (int) Math.max(0, DAILY_LIMIT - suggestions.countByTripIdAndCreatedAtGreaterThanEqual(tripId, since));
    }
}
