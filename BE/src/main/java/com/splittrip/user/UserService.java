package com.splittrip.user;

import com.splittrip.common.NotFoundException;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class UserService {
    private final UserRepository users;

    public UserService(UserRepository users) { this.users = users; }

    public User require(UUID id) {
        return users.findById(id).orElseThrow(() -> new NotFoundException("Utente non trovato"));
    }
}
