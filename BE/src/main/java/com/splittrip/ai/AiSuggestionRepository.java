package com.splittrip.ai;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface AiSuggestionRepository extends JpaRepository<AiSuggestion, UUID> {
    Optional<AiSuggestion> findFirstByTripIdAndKindOrderByCreatedAtDesc(UUID tripId, AiSuggestionKind kind);
    long countByTripIdAndCreatedAtGreaterThanEqual(UUID tripId, Instant since);
}
