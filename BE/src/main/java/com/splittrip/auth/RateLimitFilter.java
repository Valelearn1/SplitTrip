package com.splittrip.auth;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Clock;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/** Finestra scorrevole in memoria, per IP, sugli endpoint di autenticazione (D-22). */
public class RateLimitFilter extends OncePerRequestFilter {

    private final RateLimitProperties props;
    private final Clock clock;
    private final Map<String, Deque<Instant>> hits = new ConcurrentHashMap<>();

    public RateLimitFilter(RateLimitProperties props, Clock clock) {
        this.props = props;
        this.clock = clock;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !request.getRequestURI().startsWith("/api/auth/");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        if (tryAcquire(request.getRemoteAddr())) {
            chain.doFilter(request, response);
            return;
        }
        response.setStatus(429);
        response.setContentType("application/problem+json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write("{\"status\":429,\"title\":\"Troppe richieste\",\"detail\":\"Riprova tra qualche minuto\"}");
    }

    boolean tryAcquire(String key) {
        Instant now = clock.instant();
        Instant threshold = now.minus(props.window());
        Deque<Instant> deque = hits.computeIfAbsent(key, k -> new ArrayDeque<>());
        synchronized (deque) {
            while (!deque.isEmpty() && deque.peekFirst().isBefore(threshold)) {
                deque.pollFirst();
            }
            if (deque.size() >= props.maxRequests()) {
                return false;
            }
            deque.addLast(now);
            return true;
        }
    }
}
