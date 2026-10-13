package com.splittrip.auth;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

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
        RateLimitFilter filter = new RateLimitFilter(new RateLimitProperties(3, Duration.ofMinutes(1), ""), clock);

        assertThat(filter.tryAcquire("1.2.3.4")).isTrue();
        assertThat(filter.tryAcquire("1.2.3.4")).isTrue();
        assertThat(filter.tryAcquire("1.2.3.4")).isTrue();
        assertThat(filter.tryAcquire("1.2.3.4")).isFalse();
        assertThat(filter.tryAcquire("5.6.7.8")).isTrue();

        clock.now = t0.plusSeconds(61);
        assertThat(filter.tryAcquire("1.2.3.4")).isTrue();
    }

    @Test
    void dietroIlProxyUsaLHeaderConfiguratoComeChiave() throws Exception {
        RateLimitFilter filter = new RateLimitFilter(new RateLimitProperties(1, Duration.ofMinutes(1), "CF-Connecting-IP"), Clock.systemUTC());

        assertThat(statusFor(filter, "10.0.0.1", "1.1.1.1")).isEqualTo(200);
        assertThat(statusFor(filter, "10.0.0.1", "2.2.2.2")).isEqualTo(200); // stesso proxy, client diverso
        assertThat(statusFor(filter, "10.0.0.1", "1.1.1.1")).isEqualTo(429);
    }

    @Test
    void senzaHeaderConfiguratoUsaLIndirizzoDellaConnessione() throws Exception {
        RateLimitFilter filter = new RateLimitFilter(new RateLimitProperties(1, Duration.ofMinutes(1), ""), Clock.systemUTC());

        assertThat(statusFor(filter, "10.0.0.1", "1.1.1.1")).isEqualTo(200);
        assertThat(statusFor(filter, "10.0.0.1", "2.2.2.2")).isEqualTo(429); // header ignorato: non falsificabile in locale
    }

    private static int statusFor(RateLimitFilter filter, String remoteAddr, String clientIp) throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/auth/login");
        request.setRemoteAddr(remoteAddr);
        request.addHeader("CF-Connecting-IP", clientIp);
        MockHttpServletResponse response = new MockHttpServletResponse();
        filter.doFilter(request, response, new MockFilterChain());
        return response.getStatus();
    }

    static class MutableClock extends Clock {
        Instant now;
        MutableClock(Instant now) { this.now = now; }
        @Override public ZoneId getZone() { return ZoneOffset.UTC; }
        @Override public Clock withZone(ZoneId zone) { return this; }
        @Override public Instant instant() { return now; }
    }
}
