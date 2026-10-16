package com.splittrip.chat;

import com.splittrip.common.MoneyFormat;

import java.math.BigDecimal;

/** Testi delle righe evento: una fotografia, non si ricalcolano se la spesa cambia (D-40). */
final class ChatMessages {

    private ChatMessages() {}

    static String money(BigDecimal amount, String currency) {
        return MoneyFormat.format(amount, currency);
    }

    static String expense(String actor, String description, BigDecimal amount, String currency) {
        return actor + " ha aggiunto «" + description + "» · " + money(amount, currency);
    }

    static String settlement(String actor, String from, String to, BigDecimal amount, String currency) {
        return actor + " ha registrato un rimborso: " + from + " → " + to + " · " + money(amount, currency);
    }

    static String joined(String name) { return name + " ora fa parte del viaggio"; }
}
