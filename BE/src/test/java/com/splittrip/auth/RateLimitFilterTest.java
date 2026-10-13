package com.splittrip.auth;

import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZoneOffset;

import static org.assertj.core.api.Assertions.assertThat;

class RateLimitFilterTest {

    @Test
    void bloccaOltreIlLimiteERiapreDopoLaFinestra() {
        Instant t0 = Instant.parse("2026-10-12T10:00:00Z");
        MutableClock clock = new MutableClock(t0);
        RateLimitFilter filter = new RateLimitFilter(new RateLimitProperties(3, Duration.ofMinutes(1)), clock);

        assertThat(filter.tryAcquire("1.2.3.4")).isTrue();
        assertThat(filter.tryAcquire("1.2.3.4")).isTrue();
        assertThat(filter.tryAcquire("1.2.3.4")).isTrue();
        assertThat(filter.tryAcquire("1.2.3.4")).isFalse();
        assertThat(filter.tryAcquire("5.6.7.8")).isTrue();

        clock.now = t0.plusSeconds(61);
        assertThat(filter.tryAcquire("1.2.3.4")).isTrue();
    }

    static class MutableClock extends Clock {
        Instant now;
        MutableClock(Instant now) { this.now = now; }
        @Override public ZoneId getZone() { return ZoneOffset.UTC; }
        @Override public Clock withZone(ZoneId zone) { return this; }
        @Override public Instant instant() { return now; }
    }
}
