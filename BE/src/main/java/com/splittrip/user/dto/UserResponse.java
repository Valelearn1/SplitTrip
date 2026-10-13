package com.splittrip.user.dto;

import com.splittrip.user.User;

import java.util.UUID;

public record UserResponse(UUID id, String email, String displayName) {
    public static UserResponse from(User u) {
        return new UserResponse(u.getId(), u.getEmail(), u.getDisplayName());
    }
}
