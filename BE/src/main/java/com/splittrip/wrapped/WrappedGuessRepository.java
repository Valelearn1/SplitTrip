package com.splittrip.wrapped;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface WrappedGuessRepository extends JpaRepository<WrappedGuess, WrappedGuessId> {

    /** 1 se inserita, 0 se c'era già: un doppio tocco non fallisce la transazione (come le reazioni). */
    @Modifying
    @Query(value = "insert into wrapped_guesses (trip_id, participant_id, amount, created_at) values (:tripId, :participantId, :amount, :now) on conflict do nothing", nativeQuery = true)
    int insertIfAbsent(UUID tripId, UUID participantId, BigDecimal amount, Instant now);

    @Query("select g.participant.id, g.amount from WrappedGuess g where g.trip.id = :tripId order by g.createdAt")
    List<Object[]> findByTripId(UUID tripId);
}
