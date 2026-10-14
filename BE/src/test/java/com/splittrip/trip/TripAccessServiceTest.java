package com.splittrip.trip;

import com.splittrip.common.ConflictException;
import com.splittrip.common.ForbiddenException;
import com.splittrip.common.NotFoundException;
import org.junit.jupiter.api.Test;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class TripAccessServiceTest {

    TripRepository trips = mock(TripRepository.class);
    ParticipantRepository participants = mock(ParticipantRepository.class);
    TripAccessService access = new TripAccessService(trips, participants);
    UUID tripId = UUID.randomUUID();
    UUID userId = UUID.randomUUID();

    @Test
    void viaggioInesistenteDa404() {
        when(trips.existsById(tripId)).thenReturn(false);
        assertThatThrownBy(() -> access.requireMember(tripId, userId)).isInstanceOf(NotFoundException.class);
    }

    @Test
    void nonMembroDa403() {
        when(trips.existsById(tripId)).thenReturn(true);
        when(participants.findByTripIdAndUserIdAndLeftAtIsNull(tripId, userId)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> access.requireMember(tripId, userId)).isInstanceOf(ForbiddenException.class);
    }

    @Test
    void membroSempliceNonEOrganizzatore() {
        Participant m = mock(Participant.class);
        when(m.getRole()).thenReturn(MemberRole.MEMBER);
        when(trips.existsById(tripId)).thenReturn(true);
        when(participants.findByTripIdAndUserIdAndLeftAtIsNull(tripId, userId)).thenReturn(Optional.of(m));
        assertThatThrownBy(() -> access.requireOrganizer(tripId, userId)).isInstanceOf(ForbiddenException.class);
    }

    @Test
    void viaggioChiusoNonEScrivibile() {
        Trip t = mock(Trip.class);
        when(t.getStatus()).thenReturn(TripStatus.CLOSED);
        assertThatThrownBy(() -> access.requireWritable(t)).isInstanceOf(ConflictException.class);
    }
}
