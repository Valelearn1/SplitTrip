package com.splittrip.chat;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

class ChatMessagesTest {

    @Test
    void righeEventoInItalianoConImportiFormattati() {
        assertThat(ChatMessages.expense("Giulia", "Cena", new BigDecimal("45.00"), "EUR")).isEqualTo("Giulia ha aggiunto «Cena» · 45,00 €");
        assertThat(ChatMessages.expense("Giulia", "Hotel", new BigDecimal("1234.50"), "USD")).isEqualTo("Giulia ha aggiunto «Hotel» · 1.234,50 USD");
        assertThat(ChatMessages.settlement("Marco", "Marco", "Vale", new BigDecimal("20.00"), "EUR"))
                .isEqualTo("Marco ha registrato un rimborso: Marco → Vale · 20,00 €");
        assertThat(ChatMessages.joined("Nonna Pina")).isEqualTo("Nonna Pina ora fa parte del viaggio");
    }
}
