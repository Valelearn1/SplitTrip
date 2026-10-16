package com.splittrip.notification;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

class NotificationMessagesTest {

    @Test
    void messaggiInItalianoConImportiFormattati() {
        assertThat(NotificationMessages.expense("Marco", "Cena", new BigDecimal("22.50"), "EUR")).isEqualTo("Marco ha aggiunto «Cena» (tua quota 22,50 €)");
        assertThat(NotificationMessages.settlement("Giulia", new BigDecimal("15.00"), "EUR", true, "Giulia")).isEqualTo("Giulia ha registrato un rimborso di 15,00 € a te");
        assertThat(NotificationMessages.settlement("Giulia", new BigDecimal("15.00"), "EUR", false, "Marco")).isEqualTo("Giulia ha registrato un tuo rimborso di 15,00 € a Marco");
        assertThat(NotificationMessages.joined("Nonna Pina")).isEqualTo("Nonna Pina ora fa parte del viaggio");
        assertThat(NotificationMessages.todo("Marco", "Phon", "Valigia")).isEqualTo("Marco ti ha assegnato «Phon» (Valigia)");
    }

    @Test
    void descrizioniLungheVengonoAccorciatePerStareNei200Caratteri() {
        String longDesc = "x".repeat(300);
        assertThat(NotificationMessages.expense("Marco", longDesc, BigDecimal.ONE, "EUR")).hasSizeLessThanOrEqualTo(200).endsWith("€)");
    }

    @Test
    void importiNellaValutaDelViaggio() {
        assertThat(NotificationMessages.expense("Marco", "Ramen", new BigDecimal("2000.00"), "JPY")).isEqualTo("Marco ha aggiunto «Ramen» (tua quota 2.000 JPY)");
        assertThat(NotificationMessages.settlement("Giulia", new BigDecimal("15.00"), "USD", true, "Giulia")).isEqualTo("Giulia ha registrato un rimborso di 15,00 USD a te");
    }
}
