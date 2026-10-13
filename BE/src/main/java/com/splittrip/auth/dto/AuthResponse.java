package com.splittrip.auth.dto;

import com.splittrip.user.dto.UserResponse;

public record AuthResponse(String token, UserResponse user) {}
