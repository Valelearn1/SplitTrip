package com.splittrip.auth;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.time.Duration;

@ConfigurationProperties(prefix = "app.ratelimit.auth")
public record RateLimitProperties(int maxRequests, Duration window) {}
