package com.splittrip.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record PasswordChangeRequest(
        @NotBlank String currentPassword,
        @NotBlank @Size(min = 8, max = 72, message = "La password deve avere tra 8 e 72 caratteri")
        @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d).+$", message = "La password deve contenere almeno una lettera e una cifra")
        String newPassword) {}
