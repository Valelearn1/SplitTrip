package com.splittrip.trip;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TripRepository extends JpaRepository<Trip, UUID> {
    Optional<Trip> findByInviteCode(String inviteCode);
    boolean existsByInviteCode(String inviteCode);

    @Query("select m.trip from TripMember m where m.user.id = :userId order by m.trip.startDate desc")
    List<Trip> findAllByMemberUserId(UUID userId);
}
