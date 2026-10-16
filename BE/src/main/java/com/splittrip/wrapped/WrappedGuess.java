package com.splittrip.wrapped;

import com.splittrip.trip.Participant;
import com.splittrip.trip.Trip;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

/** L'ipotesi di «Indovina il totale» (D-54): una per persona e viaggio, non si cambia. */
@Entity
@Table(name = "wrapped_guesses")
@IdClass(WrappedGuessId.class)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class WrappedGuess {
    @Id @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "trip_id") private Trip trip;
    @Id @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "participant_id") private Participant participant;
    @Column(nullable = false, precision = 12, scale = 2) private BigDecimal amount;
    @Column(name = "created_at", nullable = false) private Instant createdAt;
}
