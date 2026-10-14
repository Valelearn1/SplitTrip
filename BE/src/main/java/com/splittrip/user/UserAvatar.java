package com.splittrip.user;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

/** Foto profilo, in una tabella separata: le query sugli utenti non trasportano byte. */
@Entity
@Table(name = "user_avatars")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UserAvatar {

    @Id
    @Column(name = "user_id")
    private UUID userId;

    @Column(nullable = false) private byte[] image;
    @Column(name = "updated_at", nullable = false) private Instant updatedAt;

    public UserAvatar(UUID userId, byte[] image, Instant updatedAt) {
        this.userId = userId;
        this.image = image;
        this.updatedAt = updatedAt;
    }
}
