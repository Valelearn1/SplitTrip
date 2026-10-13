package com.splittrip.user;

import com.splittrip.auth.CurrentUserId;
import com.splittrip.user.dto.UserResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/me")
public class MeController {
    private final UserService users;

    public MeController(UserService users) { this.users = users; }

    @GetMapping
    public UserResponse me(@CurrentUserId UUID userId) {
        return UserResponse.from(users.require(userId));
    }
}
