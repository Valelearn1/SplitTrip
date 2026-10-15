package com.splittrip.chat;

import com.splittrip.trip.Participant;
import com.splittrip.trip.Trip;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

/** Messaggio della chat o riga automatica di un evento (D-40). */
@Entity
@Table(name = "chat_messages")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "trip_id") private Trip trip;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "author_participant_id") private Participant author;
    /** Solo per le righe evento: chi le ha causate, che non le deve vedere come «non lette». */
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "actor_participant_id") private Participant actor;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 10) private ChatMessageKind kind;
    @Column(length = 1000) private String content;
    @Enumerated(EnumType.STRING) @Column(name = "event_type", length = 30) private ChatEventType eventType;
    @Column(name = "ref_id") private UUID refId;
    @Column(name = "created_at", nullable = false) private Instant createdAt;
    @Column(name = "deleted_at") private Instant deletedAt;

    public static ChatMessage text(Trip trip, Participant author, String content, Instant now) {
        ChatMessage m = new ChatMessage();
        m.trip = trip;
        m.author = author;
        m.kind = ChatMessageKind.TEXT;
        m.content = content;
        m.createdAt = now;
        return m;
    }

    public static ChatMessage event(Trip trip, Participant actor, ChatEventType type, String content, UUID refId, Instant now) {
        ChatMessage m = new ChatMessage();
        m.trip = trip;
        m.actor = actor;
        m.kind = ChatMessageKind.EVENT;
        m.eventType = type;
        m.content = content;
        m.refId = refId;
        m.createdAt = now;
        return m;
    }

    /** Il testo sparisce davvero dal database; resta la riga «Messaggio eliminato». */
    public void delete(Instant now) {
        this.content = null;
        this.deletedAt = now;
    }

    public boolean isDeleted() { return deletedAt != null; }
}
