package com.splittrip.chat;

import org.springframework.stereotype.Component;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/** 20 messaggi al minuto per utente, finestra scorrevole in memoria (una sola istanza su Render). */
@Component
public class ChatRateLimiter {

    static final int MAX = 20;
    static final Duration WINDOW = Duration.ofMinutes(1);

    private final Clock clock;
    private final Map<UUID, Deque<Instant>> sent = new ConcurrentHashMap<>();

    public ChatRateLimiter(Clock clock) { this.clock = clock; }

    public boolean tryAcquire(UUID userId) {
        Instant now = clock.instant();
        Deque<Instant> times = sent.computeIfAbsent(userId, k -> new ArrayDeque<>());
        synchronized (times) {
            while (!times.isEmpty() && !times.peekFirst().isAfter(now.minus(WINDOW))) times.pollFirst();
            if (times.size() >= MAX) return false;
            times.addLast(now);
            return true;
        }
    }
}
