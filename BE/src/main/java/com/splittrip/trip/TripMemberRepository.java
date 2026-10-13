package com.splittrip.trip;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TripMemberRepository extends JpaRepository<TripMember, UUID> {
    @EntityGraph(attributePaths = "user")
    List<TripMember> findByTripIdOrderByJoinedAtAsc(UUID tripId);
    Optional<TripMember> findByTripIdAndUserId(UUID tripId, UUID userId);
    boolean existsByTripIdAndUserId(UUID tripId, UUID userId);
    long countByTripId(UUID tripId);
}
