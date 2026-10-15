package com.splittrip.chat;

import com.splittrip.live.LivePublisher;
import com.splittrip.trip.Participant;
import com.splittrip.trip.ParticipantRepository;
import com.splittrip.trip.TripAccessService;
import com.splittrip.trip.TripRepository;
import com.splittrip.user.UserAvatarRepository;
import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ChatServiceTypingTest {

    @Test
    void ilLimiteDiDueSecondiSiControllaPrimaDelDatabase() {
        TripAccessService access = mock(TripAccessService.class);
        LivePublisher live = mock(LivePublisher.class);
        Participant me = mock(Participant.class);
        when(me.getId()).thenReturn(UUID.randomUUID());
        when(me.getDisplayName()).thenReturn("Marco");
        UUID tripId = UUID.randomUUID(), userId = UUID.randomUUID();
        when(access.requireMember(tripId, userId)).thenReturn(me);
        Clock clock = Clock.fixed(Instant.parse("2026-11-01T10:00:00Z"), ZoneOffset.UTC);
        ChatService chat = new ChatService(mock(ChatMessageRepository.class), mock(TripRepository.class), mock(ParticipantRepository.class),
                mock(UserAvatarRepository.class), access, new ChatRateLimiter(clock), live, mock(ReactionService.class), clock);

        for (int i = 0; i < 50; i++) chat.typing(tripId, userId); // un client che manda «sta scrivendo» a raffica

        verify(access, times(1)).requireMember(tripId, userId);   // una sola lettura del database
        verify(live, times(1)).toTrip(eq(tripId), eq("typing"), any());
    }
}
