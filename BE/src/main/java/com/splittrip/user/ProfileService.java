package com.splittrip.user;

import com.splittrip.common.FieldException;
import com.splittrip.expense.ExpenseRepository;
import com.splittrip.photo.PhotoKind;
import com.splittrip.photo.PhotoRepository;
import com.splittrip.trip.Trip;
import com.splittrip.trip.TripRepository;
import com.splittrip.user.dto.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

/** Profilo (spec v3.1 §4): dati, password, preferenze (D-48) e «i miei numeri». */
@Service
public class ProfileService {

    private final UserRepository users;
    private final UserAvatarRepository avatars;
    private final TripRepository trips;
    private final ExpenseRepository expenses;
    private final PhotoRepository photos;
    private final PasswordEncoder encoder;

    public ProfileService(UserRepository users, UserAvatarRepository avatars, TripRepository trips, ExpenseRepository expenses,
                          PhotoRepository photos, PasswordEncoder encoder) {
        this.users = users;
        this.avatars = avatars;
        this.trips = trips;
        this.expenses = expenses;
        this.photos = photos;
        this.encoder = encoder;
    }

    @Transactional
    public UserResponse update(UUID userId, ProfilePatchRequest req) {
        User u = users.findById(userId).orElseThrow();
        if (req.displayName() != null) u.setDisplayName(req.displayName().strip());
        if (req.email() != null) {
            String email = req.email().strip().toLowerCase(Locale.ROOT);
            if (!email.equals(u.getEmail()) && users.existsByEmail(email)) throw new FieldException("email", "Email già usata");
            u.setEmail(email);
        }
        return UserResponse.from(u, avatars.existsById(userId));
    }

    @Transactional
    public void changePassword(UUID userId, PasswordChangeRequest req) {
        User u = users.findById(userId).orElseThrow();
        if (!encoder.matches(req.currentPassword(), u.getPasswordHash())) throw new FieldException("currentPassword", "Password attuale non corretta");
        u.setPasswordHash(encoder.encode(req.newPassword()));
    }

    @Transactional
    public UserResponse updatePreferences(UUID userId, PreferencesPatchRequest req) {
        User u = users.findById(userId).orElseThrow();
        if (req.preferredCurrency() != null) u.setPreferredCurrency(req.preferredCurrency());
        if (req.chatSound() != null) u.setChatSound(req.chatSound());
        if (req.reduceMotion() != null) u.setReduceMotion(req.reduceMotion());
        return UserResponse.from(u, avatars.existsById(userId));
    }

    @Transactional(readOnly = true)
    public StatsResponse stats(UUID userId) {
        List<Trip> mine = trips.findAllEverJoinedByUserId(userId);
        Map<String, StatsResponse.Destination> destinations = new LinkedHashMap<>();
        for (Trip t : mine) destinations.putIfAbsent(t.getDestination(), new StatsResponse.Destination(t.getDestination(), t.getLatitude(), t.getLongitude()));
        List<UUID> ids = mine.stream().map(Trip::getId).toList();
        return new StatsResponse(mine.size(), List.copyOf(destinations.values()),
                ids.isEmpty() ? BigDecimal.ZERO.setScale(2) : expenses.groupTotal(ids).setScale(2, RoundingMode.HALF_UP),
                expenses.myShare(userId).setScale(2, RoundingMode.HALF_UP),
                photos.countByUploaderIdAndKind(userId, PhotoKind.PHOTO));
    }
}
