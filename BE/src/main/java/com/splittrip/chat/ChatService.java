package com.splittrip.chat;

import com.splittrip.chat.dto.MessagePage;
import com.splittrip.chat.dto.MessageResponse;
import com.splittrip.common.AppException;
import com.splittrip.common.FieldException;
import com.splittrip.common.ForbiddenException;
import com.splittrip.common.NotFoundException;
import com.splittrip.live.AfterCommit;
import com.splittrip.live.LivePublisher;
import com.splittrip.trip.Participant;
import com.splittrip.trip.ParticipantRepository;
import com.splittrip.trip.Trip;
import com.splittrip.trip.TripAccessService;
import com.splittrip.trip.TripRepository;
import com.splittrip.user.UserAvatarRepository;
import org.springframework.data.domain.Limit;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

/** Chat del viaggio (D-40): si scrive via REST, il canale riceve dopo il commit (D-39). */
@Service
public class ChatService {

    static final int MAX_LENGTH = 1000;
    static final int DEFAULT_PAGE = 30;
    static final int MAX_PAGE = 50;

    private final ChatMessageRepository messages;
    private final TripRepository trips;
    private final ParticipantRepository participants;
    private final UserAvatarRepository avatars;
    private final TripAccessService access;
    private final ChatRateLimiter limiter;
    private final LivePublisher live;
    private final Clock clock;

    public ChatService(ChatMessageRepository messages, TripRepository trips, ParticipantRepository participants,
                       UserAvatarRepository avatars, TripAccessService access, ChatRateLimiter limiter, LivePublisher live, Clock clock) {
        this.messages = messages;
        this.trips = trips;
        this.participants = participants;
        this.avatars = avatars;
        this.access = access;
        this.limiter = limiter;
        this.live = live;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public MessagePage list(UUID tripId, UUID userId, UUID before, Integer size) {
        access.requireMember(tripId, userId);
        int n = size == null ? DEFAULT_PAGE : Math.clamp(size, 1, MAX_PAGE);
        List<ChatMessage> found;
        if (before == null) {
            found = messages.findLatest(tripId, Limit.of(n + 1));
        } else {
            ChatMessage cursor = messages.findByIdAndTripId(before, tripId).orElseThrow(() -> new NotFoundException("Messaggio non trovato"));
            found = messages.findBefore(tripId, cursor.getCreatedAt(), cursor.getId(), Limit.of(n + 1));
        }
        boolean hasMore = found.size() > n;
        List<ChatMessage> page = hasMore ? found.subList(0, n) : found;
        return new MessagePage(toResponses(page), hasMore);
    }

    @Transactional
    public MessageResponse send(UUID tripId, UUID userId, String raw) {
        Participant me = access.requireMember(tripId, userId);
        Trip trip = trips.findById(tripId).orElseThrow();
        access.requireWritable(trip);
        String content = raw == null ? "" : raw.strip();
        if (content.isEmpty()) throw new FieldException("content", "Scrivi un messaggio");
        if (content.length() > MAX_LENGTH) throw new FieldException("content", "Al massimo 1000 caratteri");
        if (!limiter.tryAcquire(userId)) {
            throw new AppException(HttpStatus.TOO_MANY_REQUESTS, "Troppi messaggi", "Stai scrivendo troppo in fretta: riprova tra poco");
        }
        ChatMessage saved = messages.save(ChatMessage.text(trip, me, content, clock.instant()));
        return publishCreated(saved);
    }

    @Transactional
    public void delete(UUID tripId, UUID userId, UUID messageId) {
        Participant me = access.requireMember(tripId, userId);
        access.requireWritable(trips.findById(tripId).orElseThrow());
        ChatMessage m = messages.findByIdAndTripId(messageId, tripId).orElseThrow(() -> new NotFoundException("Messaggio non trovato"));
        if (m.getAuthor() == null || !m.getAuthor().getId().equals(me.getId())) {
            throw new ForbiddenException("Puoi eliminare solo i tuoi messaggi");
        }
        if (m.isDeleted()) return;
        m.delete(clock.instant());
        AfterCommit.run(() -> live.toTrip(tripId, "message.deleted", Map.of("id", messageId)));
    }

    @Transactional(readOnly = true)
    public long unreadCount(UUID tripId, UUID userId) {
        Participant me = access.requireMember(tripId, userId);
        Instant since = me.getChatReadAt() == null ? Instant.EPOCH : me.getChatReadAt();
        return messages.countUnread(tripId, me.getId(), since);
    }

    @Transactional
    public void markRead(UUID tripId, UUID userId) {
        Participant me = access.requireMember(tripId, userId);
        me.setChatReadAt(clock.instant());
        participants.save(me);
    }

    private final Map<String, Instant> lastTyping = new java.util.concurrent.ConcurrentHashMap<>();

    /** «Sta scrivendo»: non si salva, al massimo uno ogni 2 s per persona e viaggio. */
    public void typing(UUID tripId, UUID userId) {
        // prima il limite (in memoria), poi il database: un client a raffica non deve costare query
        Instant now = clock.instant();
        boolean[] allowed = {false};
        // compute è atomico: frame arrivati insieme su thread diversi non passano entrambi
        lastTyping.compute(userId + ":" + tripId, (key, last) -> {
            if (last != null && now.isBefore(last.plusSeconds(2))) return last;
            allowed[0] = true;
            return now;
        });
        if (!allowed[0]) return;
        Participant me = access.requireMember(tripId, userId);
        live.toTrip(tripId, "typing", Map.of("participantId", me.getId(), "name", me.getDisplayName()));
    }

    /** Usato anche dal listener degli eventi (Task 4): spinge il messaggio salvato dopo il commit. */
    MessageResponse publishCreated(ChatMessage saved) {
        MessageResponse response = toResponses(List.of(saved)).getFirst();
        UUID tripId = saved.getTrip().getId();
        AfterCommit.run(() -> live.toTrip(tripId, "message.created", response));
        return response;
    }

    private List<MessageResponse> toResponses(List<ChatMessage> page) {
        List<UUID> authorIds = page.stream().map(ChatMessage::getAuthor).filter(Objects::nonNull)
                .map(Participant::userId).filter(Objects::nonNull).distinct().toList();
        Set<UUID> withAvatar = authorIds.isEmpty() ? Set.of() : avatars.findUserIdsWithAvatar(authorIds);
        return page.stream().map(m -> MessageResponse.from(m, withAvatar)).toList();
    }
}
