package com.splittrip.auth.reset;

import com.splittrip.auth.AuthService;
import com.splittrip.auth.CorsProperties;
import com.splittrip.common.BadRequestException;
import com.splittrip.live.AfterCommit;
import com.splittrip.user.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;

/**
 * Password dimenticata (D-61). La richiesta risponde sempre allo stesso modo (nessuno scopre chi è registrato);
 * il token è casuale, monouso, valido 30 minuti, e in tabella c'è solo il suo hash. L'email parte dopo il commit.
 */
@Service
public class PasswordResetService {

    static final Duration TTL = Duration.ofMinutes(30);
    private static final Logger log = LoggerFactory.getLogger(PasswordResetService.class);
    private static final SecureRandom RANDOM = new SecureRandom();

    private final PasswordResetTokenRepository tokens;
    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final PasswordResetMailer mailer;
    private final CorsProperties site;
    private final Clock clock;

    public PasswordResetService(PasswordResetTokenRepository tokens, UserRepository users, PasswordEncoder encoder,
                                PasswordResetMailer mailer, CorsProperties site, Clock clock) {
        this.tokens = tokens; this.users = users; this.encoder = encoder; this.mailer = mailer; this.site = site; this.clock = clock;
    }

    @Transactional
    public void request(String email) {
        users.findByEmail(AuthService.normalize(email)).ifPresent(user -> {
            Instant now = clock.instant();
            tokens.closeOpen(user.getId(), now);
            byte[] bytes = new byte[32];
            RANDOM.nextBytes(bytes);
            String token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
            tokens.save(new PasswordResetToken(user, sha256(token), now.plus(TTL), now));
            String link = site.origin() + "/reimposta-password?token=" + token;
            String to = user.getEmail();
            AfterCommit.run(() -> {
                try {
                    mailer.send(to, link);
                } catch (RuntimeException e) {
                    log.warn("Email di ripristino non spedita: {}", e.getMessage());   // mai il token nel log
                }
            });
        });
    }

    @Transactional
    public void confirm(String token, String newPassword) {
        Instant now = clock.instant();
        PasswordResetToken reset = tokens.findByTokenHash(sha256(token))
                .filter(t -> t.usableAt(now))
                .orElseThrow(() -> new BadRequestException("Link non valido o scaduto"));
        reset.getUser().setPasswordHash(encoder.encode(newPassword));
        reset.use(now);
    }

    static String sha256(String value) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }
}
