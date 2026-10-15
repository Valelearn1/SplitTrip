package com.splittrip.trip;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TripRepository extends JpaRepository<Trip, UUID> {
    Optional<Trip> findByInviteCode(String inviteCode);
    boolean existsByInviteCode(String inviteCode);

    @Query("select p.trip from Participant p where p.user.id = :userId and p.leftAt is null order by p.trip.startDate desc")
    List<Trip> findAllByMemberUserId(UUID userId);

    /** Anche i viaggi lasciati contano nei «miei numeri». */
    @Query("select distinct p.trip from Participant p where p.user.id = :userId")
    List<Trip> findAllEverJoinedByUserId(UUID userId);
}
