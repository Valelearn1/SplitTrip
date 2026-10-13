package com.splittrip.auth;

import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class JwtServiceTest {

    JwtProperties props = new JwtProperties("test-secret-test-secret-test-secret-test", Duration.ofHours(24));
    JwtConfig config = new JwtConfig();
    JwtEncoder encoder = config.jwtEncoder(config.jwtKey(props));
    JwtDecoder decoder = config.jwtDecoder(config.jwtKey(props));
    // Orologio fisso a "adesso" (al secondo): il decoder usa l'ora reale per controllare la scadenza
    Instant now = Instant.now().truncatedTo(ChronoUnit.SECONDS);
    Clock clock = Clock.fixed(now, ZoneOffset.UTC);
    JwtService service = new JwtService(encoder, props, clock);

    @Test
    void ilTokenContieneSoloSubjectEScadenzaA24Ore() {
        UUID userId = UUID.randomUUID();
        Jwt jwt = decoder.decode(service.issue(userId));
        assertThat(jwt.getSubject()).isEqualTo(userId.toString());
        assertThat(jwt.getExpiresAt()).isEqualTo(now.plus(Duration.ofHours(24)));
        assertThat(jwt.getClaims().keySet()).containsExactlyInAnyOrder("sub", "iat", "exp");
    }
}
