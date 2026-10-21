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

    /** Valuta e cambio di una spesa o di un rimborso (D-69): vuota = valuta del viaggio, cambio 1. */
    public record Money(String currency, BigDecimal fxRate) {}

    /**
     * Valuta e cambio della richiesta con la valuta del viaggio come base: cambio obbligatorio se la valuta è diversa,
     * tetti per valuta sull'importo e sul convertito (D-70).
     */
    public static Money money(String reqCurrency, BigDecimal reqFxRate, BigDecimal amount, String tripCurrency) {
        String currency = reqCurrency == null ? tripCurrency : reqCurrency;
        BigDecimal fxRate = reqFxRate;
        if (currency.equals(tripCurrency)) {
            fxRate = BigDecimal.ONE;
        } else if (fxRate == null) {
            throw new FieldException("fxRate", "Scrivi quanto vale 1 " + currency + " in " + tripCurrency);
        }
        check("amount", amount, currency);
        check("amount", convert(amount, fxRate, tripCurrency), tripCurrency);
        return new Money(currency, fxRate);
    }

    public static BigDecimal convert(BigDecimal amount, BigDecimal fxRate) {
        return amount.multiply(fxRate).setScale(2, RoundingMode.HALF_UP);
    }

    /** Convertito nei decimali della valuta del viaggio (in yen 1778,20 → 1778), salvato sempre a 2 decimali (revisione v3.6). */
    public static BigDecimal convert(BigDecimal amount, BigDecimal fxRate, String tripCurrency) {
        return amount.multiply(fxRate).setScale(Currencies.fractionDigits(tripCurrency), RoundingMode.HALF_UP).setScale(2, RoundingMode.UNNECESSARY);
    }

    /** «Lo yen giapponese», «Il fiorino ungherese», «La corona islandese», «Il won sudcoreano»: l'articolo dal nome italiano. */
    private static String article(String name) {
        String first = name.split(" ")[0];
        if (first.startsWith("yen") || first.startsWith("zloty")) return "Lo ";
        if (first.endsWith("a")) return "La ";
        return "Il ";
    }
}
