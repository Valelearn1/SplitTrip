package com.splittrip.expense;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SettlementRepository extends JpaRepository<Settlement, UUID> {

    @Query("""
            select s from Settlement s join fetch s.fromUser join fetch s.toUser join fetch s.createdBy
            where s.trip.id = :tripId order by s.date desc, s.createdAt desc
            """)
    List<Settlement> findAllByTripIdWithUsers(UUID tripId);

    Optional<Settlement> findByIdAndTripId(UUID id, UUID tripId);

    @Query("""
            select count(s) > 0 from Settlement s
            where s.trip.id = :tripId and (s.fromUser.id = :userId or s.toUser.id = :userId)
            """)
    boolean existsByTripIdAndUserInvolved(UUID tripId, UUID userId);
}
