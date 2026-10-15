package com.splittrip.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Campi null = non toccare. */
public record ProfilePatchRequest(
        @Pattern(regexp = ".*\\S.*", message = "non può essere vuoto") @Size(min = 2, max = 40) String displayName,
        @Email @Size(max = 160) String email) {}
