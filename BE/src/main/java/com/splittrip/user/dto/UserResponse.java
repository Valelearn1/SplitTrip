package com.splittrip.user.dto;

import com.splittrip.user.User;

import java.util.UUID;

public record UserResponse(UUID id, String email, String displayName, boolean hasAvatar,
                           String preferredCurrency, boolean chatSound, boolean reduceMotion) {
    public static UserResponse from(User u, boolean hasAvatar) {
        return new UserResponse(u.getId(), u.getEmail(), u.getDisplayName(), hasAvatar,
                u.getPreferredCurrency(), u.isChatSound(), u.isReduceMotion());
    }
}
