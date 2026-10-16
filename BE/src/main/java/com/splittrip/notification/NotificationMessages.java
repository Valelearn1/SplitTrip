package com.splittrip.notification;

import com.splittrip.common.MoneyFormat;

import java.math.BigDecimal;

/** Testi delle notifiche, già in italiano: chi legge non deve fare conti. */
final class NotificationMessages {
    private static final int MAX = 200;
    private NotificationMessages() {}

    static String expense(String actorName, String description, BigDecimal share, String currency) {
        String tail = "» (tua quota " + MoneyFormat.format(share, currency) + ")";
        String head = actorName + " ha aggiunto «";
        return head + clip(description, MAX - head.length() - tail.length()) + tail;
    }

    static String settlement(String actorName, BigDecimal amount, String currency, boolean youReceive, String otherName) {
        String money = MoneyFormat.format(amount, currency);
        return youReceive
                ? actorName + " ha registrato un rimborso di " + money + " a te"
                : actorName + " ha registrato un tuo rimborso di " + money + " a " + otherName;
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
