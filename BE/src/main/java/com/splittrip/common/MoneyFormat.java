package com.splittrip.common;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.util.Locale;

/** Importi nei testi scritti dal server (chat, notifiche): all'italiana, nella valuta del viaggio, coi suoi decimali. */
public final class MoneyFormat {

    private MoneyFormat() {}

    public static String format(BigDecimal amount, String currency) {
        int digits = fractionDigits(currency);
        String pattern = digits > 0 ? "#,##0." + "0".repeat(digits) : "#,##0";
        String number = new DecimalFormat(pattern, DecimalFormatSymbols.getInstance(Locale.ITALY))
                .format(amount.setScale(digits, RoundingMode.HALF_UP));
        return number + ("EUR".equals(currency) ? " €" : " " + currency);
    }

    private static int fractionDigits(String currency) {
        return Currencies.fractionDigits(currency);   // D-70: stesso elenco del browser (HUF senza decimali)
    }
}
