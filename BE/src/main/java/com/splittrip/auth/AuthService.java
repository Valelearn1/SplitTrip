package com.splittrip.auth;

import com.splittrip.auth.dto.AuthResponse;
import com.splittrip.auth.dto.LoginRequest;
import com.splittrip.auth.dto.RegisterRequest;
import com.splittrip.common.ConflictException;
import com.splittrip.common.UnauthorizedException;
import com.splittrip.user.User;
import com.splittrip.user.UserAvatarRepository;
import com.splittrip.user.UserRepository;
import com.splittrip.user.dto.UserResponse;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.util.Locale;

@Service
public class AuthService {

    private final UserRepository users;
    private final UserAvatarRepository avatars;
    private final PasswordEncoder encoder;
    private final JwtService jwt;
    private final Clock clock;

    public AuthService(UserRepository users, UserAvatarRepository avatars, PasswordEncoder encoder, JwtService jwt, Clock clock) {
        this.users = users;
        this.avatars = avatars;
        this.encoder = encoder;
        this.jwt = jwt;
        this.clock = clock;
    }

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        String email = normalize(req.email());
        if (users.existsByEmail(email)) {
            throw new ConflictException("Esiste già un account con questa email");
        }
        User user = users.save(new User(email, encoder.encode(req.password()), req.displayName().strip(), clock.instant()));
        return new AuthResponse(jwt.issue(user.getId()), UserResponse.from(user, false));
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest req) {
        // Stesso messaggio per email inesistente e password sbagliata: non rivelare se l'account esiste
        User user = users.findByEmail(normalize(req.email()))
                .filter(u -> encoder.matches(req.password(), u.getPasswordHash()))
                .orElseThrow(() -> new UnauthorizedException("Credenziali non valide"));
        return new AuthResponse(jwt.issue(user.getId()), UserResponse.from(user, avatars.existsById(user.getId())));
    }

    /** Email come la salva e la cerca l'app: senza spazi ai lati e in minuscolo. */
    public static String normalize(String email) {
        return email.strip().toLowerCase(Locale.ROOT);
    }
}
