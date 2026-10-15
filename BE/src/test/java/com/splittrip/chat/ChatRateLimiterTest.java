package com.splittrip.chat;

import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class ChatRateLimiterTest {

    static class MovableClock extends Clock {
        Instant now = Instant.parse("2026-11-01T10:00:00Z");
        @Override public ZoneOffset getZone() { return ZoneOffset.UTC; }
        @Override public Clock withZone(java.time.ZoneId zone) { return this; }
        @Override public Instant instant() { return now; }
    }

    @Test
    void ventiAlMinutoPoiBloccaEDopoUnMinutoRiparte() {
        MovableClock clock = new MovableClock();
        ChatRateLimiter limiter = new ChatRateLimiter(clock);
        UUID vale = UUID.randomUUID();
        for (int i = 0; i < 20; i++) assertThat(limiter.tryAcquire(vale)).isTrue();
        assertThat(limiter.tryAcquire(vale)).isFalse();
        assertThat(limiter.tryAcquire(UUID.randomUUID())).isTrue(); // gli altri non sono toccati
        clock.now = clock.now.plusSeconds(61);
        assertThat(limiter.tryAcquire(vale)).isTrue();
    }
}
