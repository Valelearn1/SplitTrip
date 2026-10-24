package com.splittrip.auth.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank @Email @Size(max = 255) String email,
        @NotBlank @Size(min = 8, max = 72, message = "La password deve avere tra 8 e 72 caratteri")
        @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d).+$", message = "La password deve contenere almeno una lettera e una cifra")
        String password,
        @NotBlank @Size(min = 2, max = 40) String displayName,
        // D-73: la casella «Accetto i Termini e condizioni»; Boolean perché @AssertTrue da solo lascerebbe passare null
        @NotNull(message = TERMS) @AssertTrue(message = TERMS) Boolean acceptedTerms) {

    static final String TERMS = "Per registrarti accetta i Termini e condizioni";
}
