package com.splittrip.notification;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

class NotificationMessagesTest {

    @Test
    void messaggiInItalianoConImportiFormattati() {
        assertThat(NotificationMessages.expense("Marco", "Cena", new BigDecimal("22.50"), "EUR", new BigDecimal("45.00"), "EUR", new BigDecimal("45.00"))).isEqualTo("Marco ha aggiunto «Cena» (tua quota 22,50 €)");
        assertThat(NotificationMessages.settlement("Giulia", new BigDecimal("15.00"), "EUR", true, "Giulia", new BigDecimal("15.00"), "EUR")).isEqualTo("Giulia ha registrato un rimborso di 15,00 € a te");
        assertThat(NotificationMessages.settlement("Giulia", new BigDecimal("15.00"), "EUR", false, "Marco", new BigDecimal("15.00"), "EUR")).isEqualTo("Giulia ha registrato un tuo rimborso di 15,00 € a Marco");
        assertThat(NotificationMessages.joined("Nonna Pina")).isEqualTo("Nonna Pina ora fa parte del viaggio");
        assertThat(NotificationMessages.todo("Marco", "Phon", "Valigia")).isEqualTo("Marco ti ha assegnato «Phon» (Valigia)");
    }

    @Test
    void descrizioniLungheVengonoAccorciatePerStareNei200Caratteri() {
        String longDesc = "x".repeat(300);
        assertThat(NotificationMessages.expense("Marco", longDesc, BigDecimal.ONE, "EUR", BigDecimal.ONE, "EUR", BigDecimal.ONE)).hasSizeLessThanOrEqualTo(200).endsWith("€)");
    }

    @Test
    void importiNellaValutaDelViaggio() {
        assertThat(NotificationMessages.expense("Marco", "Ramen", new BigDecimal("2000.00"), "JPY", new BigDecimal("4000"), "JPY", new BigDecimal("4000"))).isEqualTo("Marco ha aggiunto «Ramen» (tua quota 2.000 JPY)");
        // D-69: scontrino in un'altra valuta → si vede anche quanto è stato pagato
        assertThat(NotificationMessages.expense("Ada", "Cena", new BigDecimal("5.62"), "EUR", new BigDecimal("2000"), "JPY", new BigDecimal("11.25")))
                .isEqualTo("Ada ha aggiunto «Cena» (tua quota 5,62 €, pagata 2.000 JPY = 11,25 €)");
        assertThat(NotificationMessages.settlement("Bruno", new BigDecimal("28.12"), "EUR", true, "Bruno", new BigDecimal("5000"), "JPY"))
                .isEqualTo("Bruno ha registrato un rimborso di 28,12 € (5.000 JPY) a te");
        assertThat(NotificationMessages.settlement("Giulia", new BigDecimal("15.00"), "USD", true, "Giulia", new BigDecimal("15.00"), "USD")).isEqualTo("Giulia ha registrato un rimborso di 15,00 USD a te");
    }
}
