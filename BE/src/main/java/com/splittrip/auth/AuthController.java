package com.splittrip.auth;

import com.splittrip.auth.dto.AuthResponse;
import com.splittrip.auth.dto.LoginRequest;
import com.splittrip.auth.dto.PasswordResetConfirm;
import com.splittrip.auth.dto.PasswordResetRequest;
import com.splittrip.auth.dto.RegisterRequest;
import com.splittrip.auth.reset.PasswordResetService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService auth;
    private final PasswordResetService reset;

    public AuthController(AuthService auth, PasswordResetService reset) { this.auth = auth; this.reset = reset; }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody RegisterRequest req) {
        return auth.register(req);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest req) {
        return auth.login(req);
    }

    /** Sempre 204, anche per un'email sconosciuta: nessuno scopre chi è registrato (D-61). */
    @PostMapping("/password-reset/request")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void requestReset(@Valid @RequestBody PasswordResetRequest req) {
        reset.request(req.email());
    }

    @PostMapping("/password-reset/confirm")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void confirmReset(@Valid @RequestBody PasswordResetConfirm req) {
        reset.confirm(req.token(), req.newPassword());
    }
}
