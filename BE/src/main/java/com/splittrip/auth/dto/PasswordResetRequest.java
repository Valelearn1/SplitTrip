package com.splittrip.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Come il login: niente @Email, l'indirizzo si normalizza (spazi, maiuscole) e uno malformato non trova nessuno (sempre 204). */
public record PasswordResetRequest(@NotBlank @Size(max = 255) String email) {}
