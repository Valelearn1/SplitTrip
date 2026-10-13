package com.splittrip.trip;

import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.util.Locale;

@Component
public class InviteCodeGenerator {

    /** Senza 0/O, 1/I: si dettano al telefono senza ambiguità. */
    private static final String ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private final SecureRandom random = new SecureRandom();

    public String generate() {
        StringBuilder sb = new StringBuilder(9);
        for (int i = 0; i < 8; i++) {
            if (i == 4) sb.append('-');
            sb.append(ALPHABET.charAt(random.nextInt(ALPHABET.length())));
        }
        return sb.toString();
    }

    public static String normalize(String code) {
        return code == null ? "" : code.strip().toUpperCase(Locale.ROOT);
    }
}
