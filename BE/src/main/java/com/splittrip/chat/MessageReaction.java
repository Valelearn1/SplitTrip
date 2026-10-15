package com.splittrip.chat;

import com.splittrip.trip.Participant;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;

/** Una reazione (D-47): una per emoji per persona. */
@Entity
@Table(name = "message_reactions")
@IdClass(MessageReactionId.class)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MessageReaction {

    @Id @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "message_id") private ChatMessage message;
    @Id @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "participant_id") private Participant participant;
    @Id @Column(nullable = false, length = 8) private String emoji;
    @Column(name = "created_at", nullable = false) private Instant createdAt;

    public MessageReaction(ChatMessage message, Participant participant, String emoji, Instant now) {
        this.message = message;
        this.participant = participant;
        this.emoji = emoji;
        this.createdAt = now;
    }
}
