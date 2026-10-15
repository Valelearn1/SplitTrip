package com.splittrip.chat;

import com.splittrip.chat.dto.ReactionSummary;
import com.splittrip.common.BadRequestException;
import com.splittrip.common.ConflictException;
import com.splittrip.common.NotFoundException;
import com.splittrip.live.AfterCommit;
import com.splittrip.live.LivePublisher;
import com.splittrip.trip.Participant;
import com.splittrip.trip.TripAccessService;
import com.splittrip.trip.TripRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/** Reazioni (D-47): sei emoji, una per persona, solo su messaggi di testo; il canale riceve il riepilogo dopo il commit. */
@Service
public class ReactionService {

    public static final List<String> ALLOWED = List.of("👍", "❤️", "😂", "😮", "😢", "🎉");

    private final MessageReactionRepository reactions;
    private final ChatMessageRepository messages;
    private final TripRepository trips;
    private final TripAccessService access;
    private final LivePublisher live;
    private final Clock clock;

    public ReactionService(MessageReactionRepository reactions, ChatMessageRepository messages, TripRepository trips,
                           TripAccessService access, LivePublisher live, Clock clock) {
        this.reactions = reactions;
        this.messages = messages;
        this.trips = trips;
        this.access = access;
        this.live = live;
        this.clock = clock;
    }

    @Transactional
    public void add(UUID tripId, UUID userId, UUID messageId, String emoji) {
        String canonical = canonical(emoji);
        Participant me = prepare(tripId, userId);
        target(tripId, messageId);
        reactions.insertIfAbsent(messageId, me.getId(), canonical, clock.instant());
        publish(tripId, messageId);
    }

    @Transactional
    public void remove(UUID tripId, UUID userId, UUID messageId, String emoji) {
        String canonical = canonical(emoji);
        Participant me = prepare(tripId, userId);
        target(tripId, messageId);
        reactions.deleteOne(messageId, me.getId(), canonical);
        publish(tripId, messageId);
    }

    /** Riepilogo per ogni messaggio della pagina, nell'ordine delle emoji permesse. */
    @Transactional(readOnly = true)
    public Map<UUID, List<ReactionSummary>> summaries(Collection<UUID> messageIds) {
        Map<UUID, Map<String, List<UUID>>> grouped = new LinkedHashMap<>();
        if (!messageIds.isEmpty()) {
            for (Object[] row : reactions.findByMessageIds(messageIds)) {
                grouped.computeIfAbsent((UUID) row[0], k -> new LinkedHashMap<>())
                        .computeIfAbsent((String) row[1], k -> new ArrayList<>()).add((UUID) row[2]);
            }
        }
        Map<UUID, List<ReactionSummary>> out = new LinkedHashMap<>();
        for (UUID id : messageIds) {
            Map<String, List<UUID>> byEmoji = grouped.getOrDefault(id, Map.of());
            List<ReactionSummary> list = new ArrayList<>();
            for (String e : ALLOWED) {
                List<UUID> who = byEmoji.get(e);
                if (who != null && !who.isEmpty()) list.add(new ReactionSummary(e, who.size(), List.copyOf(who)));
            }
            out.put(id, list);
        }
        return out;
    }

    private Participant prepare(UUID tripId, UUID userId) {
        Participant me = access.requireMember(tripId, userId);
        access.requireWritable(trips.findById(tripId).orElseThrow());
        return me;
    }

    /** La forma della lista; «❤» senza selettore di variante (U+FE0F) vale come «❤️». */
    static String canonical(String emoji) {
        String bare = emoji == null ? "" : emoji.replace("\uFE0F", "");
        return ALLOWED.stream().filter(e -> e.replace("\uFE0F", "").equals(bare)).findFirst()
                .orElseThrow(() -> new BadRequestException("Emoji non permessa"));
    }

    private ChatMessage target(UUID tripId, UUID messageId) {
        ChatMessage m = messages.findByIdAndTripId(messageId, tripId).orElseThrow(() -> new NotFoundException("Messaggio non trovato"));
        if (m.getKind() != ChatMessageKind.TEXT || m.isDeleted()) throw new ConflictException("Non si può reagire a questo messaggio");
        return m;
    }

    /** Il riepilogo si legge dopo il commit: con due reazioni insieme, l'ultimo invio le vede entrambe. */
    private void publish(UUID tripId, UUID messageId) {
        AfterCommit.run(() -> live.toTrip(tripId, "message.reacted",
                Map.of("id", messageId, "reactions", summaries(List.of(messageId)).get(messageId))));
    }
}
