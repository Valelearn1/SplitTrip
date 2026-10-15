package com.splittrip.chat;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.util.Locale;

/** Testi delle righe evento: una fotografia, non si ricalcolano se la spesa cambia (D-40). */
final class ChatMessages {

    private ChatMessages() {}

    static String money(BigDecimal amount, String currency) {
        String n = new DecimalFormat("#,##0.00", DecimalFormatSymbols.getInstance(Locale.ITALY)).format(amount.setScale(2, RoundingMode.HALF_UP));
        return n + ("EUR".equals(currency) ? " €" : " " + currency);
    }

    static String expense(String actor, String description, BigDecimal amount, String currency) {
        return actor + " ha aggiunto «" + description + "» · " + money(amount, currency);
    }

    static String settlement(String actor, String from, String to, BigDecimal amount, String currency) {
        return actor + " ha registrato un rimborso: " + from + " → " + to + " · " + money(amount, currency);
    }

    static String joined(String name) { return name + " ora fa parte del viaggio"; }
}
