package com.splittrip.ai;

import com.splittrip.trip.Trip;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

/** Una generazione riuscita: serve a rimostrare i consigli e a contare il limite giornaliero. */
@Entity
@Table(name = "ai_suggestions")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class AiSuggestion {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "trip_id") private Trip trip;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 10) private AiSuggestionKind kind;
    @Column(nullable = false, columnDefinition = "text") private String content;
    @Column(name = "created_at", nullable = false) private Instant createdAt;

    public AiSuggestion(Trip trip, AiSuggestionKind kind, String content, Instant now) {
        this.trip = trip;
        this.kind = kind;
        this.content = content;
        this.createdAt = now;
    }
}
