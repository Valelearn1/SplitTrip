package com.splittrip.user;

import com.splittrip.common.FieldException;
import com.splittrip.common.NotFoundException;
import com.splittrip.common.PayloadTooLargeException;
import com.splittrip.photo.ImageProcessor;
import com.splittrip.photo.ImageSlots;
import com.splittrip.trip.ParticipantRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.Clock;
import java.util.UUID;

/** Foto profilo (D-37): visibile solo a sé stessi e a chi condivide un viaggio attivo. */
@Service
public class AvatarService {

    private static final long MAX_BYTES = 3L * 1024 * 1024;

    private final UserAvatarRepository avatars;
    private final ParticipantRepository participants;
    private final UserService users;
    private final ImageSlots slots;
    private final Clock clock;

    public AvatarService(UserAvatarRepository avatars, ParticipantRepository participants, UserService users, ImageSlots slots, Clock clock) {
        this.avatars = avatars;
        this.participants = participants;
        this.users = users;
        this.slots = slots;
        this.clock = clock;
    }

    /** Come le foto: l'immagine si elabora fuori transazione e con gli stessi due posti (D-35). */
    public void set(UUID userId, MultipartFile file) {
        users.require(userId);
        if (file == null || file.isEmpty()) throw new FieldException("file", "Scegli una foto");
        if (file.getSize() > MAX_BYTES) throw new PayloadTooLargeException();
        byte[] image = slots.process(file, ImageProcessor::avatar);
        UserAvatar avatar = avatars.findById(userId).orElse(null);
        if (avatar == null) {
            avatar = new UserAvatar(userId, image, clock.instant());
        } else {
            avatar.setImage(image);
            avatar.setUpdatedAt(clock.instant());
        }
        avatars.save(avatar);
    }

    @Transactional
    public void remove(UUID userId) {
        avatars.deleteById(userId);
    }

    @Transactional(readOnly = true)
    public UserAvatar get(UUID viewerId, UUID userId) {
        // Stesso 404 per «non ha avatar» e «non puoi vederlo»: non si rivela nulla a un estraneo
        if (!viewerId.equals(userId) && !participants.sharesActiveTrip(viewerId, userId)) {
            throw new NotFoundException("Foto profilo non trovata");
        }
        return avatars.findById(userId).orElseThrow(() -> new NotFoundException("Foto profilo non trovata"));
    }

    @Transactional(readOnly = true)
    public boolean has(UUID userId) {
        return avatars.existsById(userId);
    }
}
