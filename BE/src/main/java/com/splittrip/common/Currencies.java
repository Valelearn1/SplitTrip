package com.splittrip.common;

import java.util.Currency;
import java.util.Set;

/** D-70: valute senza centesimi, lo stesso elenco di FE/src/shared/utils/currencies.ts (Java darebbe 2 decimali al fiorino). */
public final class Currencies {
    public static final Set<String> NO_CENTS = Set.of("JPY", "HUF", "ISK", "KRW");

    private Currencies() {}

    public static int fractionDigits(String currency) {
        if (NO_CENTS.contains(currency)) return 0;
        try {
            return Math.max(0, Currency.getInstance(currency).getDefaultFractionDigits());
        } catch (IllegalArgumentException e) {
            return 2;
        }
    }

    /** «yen giapponese», «fiorino ungherese» (minuscolo): per i messaggi. */
    public static String name(String currency) {
        try {
            return Currency.getInstance(currency).getDisplayName(java.util.Locale.ITALIAN).toLowerCase(java.util.Locale.ITALIAN);
        } catch (IllegalArgumentException e) {
            return currency;
        }
    }
}
