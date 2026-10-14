package com.splittrip.notification;

import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.util.Locale;

/** Testi delle notifiche, già in italiano: chi legge non deve fare conti. */
final class NotificationMessages {
    private static final int MAX = 200;
    private NotificationMessages() {}

    static String money(BigDecimal amount) {
        return new DecimalFormat("#,##0.00", DecimalFormatSymbols.getInstance(Locale.ITALY)).format(amount) + " €";
    }

    static String expense(String actorName, String description, BigDecimal share) {
        String tail = "» (tua quota " + money(share) + ")";
        String head = actorName + " ha aggiunto «";
        return head + clip(description, MAX - head.length() - tail.length()) + tail;
    }

    static String settlement(String actorName, BigDecimal amount, boolean youReceive, String otherName) {
        return youReceive
                ? actorName + " ha registrato un rimborso di " + money(amount) + " a te"
                : actorName + " ha registrato un tuo rimborso di " + money(amount) + " a " + otherName;
    }

    static String joined(String name) { return name + " ora fa parte del viaggio"; }

    static String todo(String actorName, String itemText, String listTitle) {
        String head = actorName + " ti ha assegnato «";
        String tail = "» (" + listTitle + ")";
        return head + clip(itemText, MAX - head.length() - tail.length()) + tail;
    }

    private static String clip(String s, int max) {
        return s.length() <= max ? s : s.substring(0, Math.max(0, max - 1)) + "…";
    }
}
