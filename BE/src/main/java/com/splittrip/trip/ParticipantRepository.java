package com.splittrip.trip;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ParticipantRepository extends JpaRepository<Participant, UUID> {
    /** Attivi, in ordine di ingresso: è la lista mostrata nel viaggio. */
    @EntityGraph(attributePaths = "user")
    List<Participant> findByTripIdAndLeftAtIsNullOrderByJoinedAtAsc(UUID tripId);
    /** Tutti, anche chi ha lasciato: serve ai saldi e al cestino per i nomi. */
    List<Participant> findByTripIdOrderByJoinedAtAsc(UUID tripId);
    Optional<Participant> findByTripIdAndUserIdAndLeftAtIsNull(UUID tripId, UUID userId);
    Optional<Participant> findByTripIdAndUserId(UUID tripId, UUID userId);
    Optional<Participant> findByIdAndTripId(UUID id, UUID tripId);
    List<Participant> findByTripIdAndUserIsNullAndLeftAtIsNullOrderByJoinedAtAsc(UUID tripId);
    long countByTripIdAndLeftAtIsNull(UUID tripId);
}
