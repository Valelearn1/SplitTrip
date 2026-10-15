package com.splittrip.user;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Setter
    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Setter
    @Column(name = "display_name", nullable = false, length = 40)
    private String displayName;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    // Preferenze sull'account (D-48): si ritrovano su ogni dispositivo
    @Setter @Column(name = "preferred_currency", nullable = false, length = 3) private String preferredCurrency = "EUR";
    @Setter @Column(name = "chat_sound", nullable = false) private boolean chatSound = true;
    @Setter @Column(name = "reduce_motion", nullable = false) private boolean reduceMotion = false;

    public User(String email, String passwordHash, String displayName, Instant createdAt) {
        this.email = email;
        this.passwordHash = passwordHash;
        this.displayName = displayName;
        this.createdAt = createdAt;
    }
}
