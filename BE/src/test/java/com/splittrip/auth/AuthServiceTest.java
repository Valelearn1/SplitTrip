package com.splittrip.auth;

import com.splittrip.auth.dto.LoginRequest;
import com.splittrip.auth.dto.RegisterRequest;
import com.splittrip.common.ConflictException;
import com.splittrip.common.UnauthorizedException;
import com.splittrip.user.User;
import com.splittrip.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.time.Clock;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AuthServiceTest {

    UserRepository users = mock(UserRepository.class);
    JwtService jwt = mock(JwtService.class);
    AuthService service = new AuthService(users, mock(com.splittrip.user.UserAvatarRepository.class), new BCryptPasswordEncoder(4), jwt, Clock.systemUTC());

    @Test
    void registrazioneNormalizzaEmailEHashaLaPassword() {
        when(users.existsByEmail("marco@example.com")).thenReturn(false);
        when(users.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(jwt.issue(any())).thenReturn("tok");

        service.register(new RegisterRequest("  Marco@Example.com ", "password1", "Marco", true));

        verify(users).save(argThat(u -> u.getEmail().equals("marco@example.com")
                && !u.getPasswordHash().equals("password1")));
    }

    @Test
    void registrazioneConEmailGiaUsataDa409() {
        when(users.existsByEmail("marco@example.com")).thenReturn(true);
        assertThatThrownBy(() -> service.register(new RegisterRequest("marco@example.com", "password1", "Marco", true)))
                .isInstanceOf(ConflictException.class);
    }

    @Test
    void loginConPasswordSbagliataDa401Generico() {
        User u = new User("marco@example.com", new BCryptPasswordEncoder(4).encode("password1"), "Marco", Clock.systemUTC().instant());
        when(users.findByEmail("marco@example.com")).thenReturn(Optional.of(u));
        assertThatThrownBy(() -> service.login(new LoginRequest("marco@example.com", "sbagliata")))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessage("Credenziali non valide");
    }

    @Test
    void loginConEmailInesistenteDaLoStessoMessaggio() {
        when(users.findByEmail("nessuno@example.com")).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.login(new LoginRequest("nessuno@example.com", "password1")))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessage("Credenziali non valide");
    }
}
