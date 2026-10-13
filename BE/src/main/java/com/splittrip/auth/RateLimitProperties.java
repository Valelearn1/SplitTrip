package com.splittrip.auth;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.time.Duration;

/** {@code clientIpHeader}: header con l'IP reale del client dietro un proxy fidato (vuoto = indirizzo della connessione). */
@ConfigurationProperties(prefix = "app.ratelimit.auth")
public record RateLimitProperties(int maxRequests, Duration window, String clientIpHeader) {}
