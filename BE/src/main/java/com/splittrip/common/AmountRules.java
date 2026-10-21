package com.splittrip.common;

import java.math.BigDecimal;
import java.math.RoundingMode;

/** D-70: tetti per valuta (999.999,99 con centesimi, 99.999.999 senza); D-69: conversione nella valuta del viaggio. */
public final class AmountRules {
    public static final String TOO_MUCH_CENTS = "Al massimo 999.999,99 (due decimali)";
    public static final String TOO_MUCH_NO_CENTS = "Al massimo 99.999.999 (senza decimali)";

    private AmountRules() {}

    public static void check(String field, BigDecimal amount, String currency) {
        int digits = Currencies.fractionDigits(currency);
        if (amount.stripTrailingZeros().scale() > digits) {
            throw new FieldException(field, digits == 0
                    ? article(Currencies.name(currency)) + Currencies.name(currency) + " non ha centesimi" : TOO_MUCH_CENTS);
        }
        int maxInt = digits == 0 ? 8 : 6;
        if (amount.setScale(digits, RoundingMode.HALF_UP).precision() - digits > maxInt) {
            throw new FieldException(field, digits == 0 ? TOO_MUCH_NO_CENTS : TOO_MUCH_CENTS);
        }
    }

    public static BigDecimal convert(BigDecimal amount, BigDecimal fxRate) {
        return amount.multiply(fxRate).setScale(2, RoundingMode.HALF_UP);
    }

    /** «Lo yen giapponese», «Il fiorino ungherese», «La corona islandese», «Il won sudcoreano»: l'articolo dal nome italiano. */
    private static String article(String name) {
        String first = name.split(" ")[0];
        if (first.startsWith("yen") || first.startsWith("zloty")) return "Lo ";
        if (first.endsWith("a")) return "La ";
        return "Il ";
    }
}
