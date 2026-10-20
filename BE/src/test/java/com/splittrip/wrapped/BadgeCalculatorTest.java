package com.splittrip.wrapped;

import com.splittrip.wrapped.dto.WrappedResponse.Badge;
import com.splittrip.wrapped.dto.WrappedResponse.BadgeCode;
import com.splittrip.wrapped.dto.WrappedResponse.Person;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class BadgeCalculatorTest {

    static final UUID VALE = UUID.randomUUID(), MARCO = UUID.randomUUID(), PINA = UUID.randomUUID();
    static final Instant T0 = Instant.parse("2026-10-01T10:00:00Z");

    static Person person(UUID id, String name, boolean account, Instant joined, String paid, int photos, int messages, int reactions, String food, int places) {
        return new Person(id, name, account, account ? UUID.randomUUID() : null, joined, new BigDecimal(paid), photos, messages, reactions, new BigDecimal(food), places);
    }

    static List<BadgeCode> codesOf(List<Badge> badges, UUID who) {
        return badges.stream().filter(b -> b.participantId().equals(who)).map(Badge::code).toList();
    }

    @Test
    void ogniBadgeAlMassimoEZeroNonVince() {
        List<Person> people = List.of(
                person(VALE, "Vale", true, T0, "620.00", 14, 3, 9, "0.00", 3),
                person(MARCO, "Marco", true, T0.plusSeconds(60), "96.00", 0, 31, 2, "96.00", 0),
                person(PINA, "Nonna Pina", false, T0.plusSeconds(120), "0.00", 0, 0, 0, "0.00", 0));
        List<Badge> badges = BadgeCalculator.compute(people, Map.of(MARCO, T0.plusSeconds(3600)), "EUR");
        assertThat(codesOf(badges, VALE)).containsExactly(BadgeCode.BANKER, BadgeCode.PHOTOGRAPHER, BadgeCode.LOVED, BadgeCode.EXPLORER);
        assertThat(codesOf(badges, MARCO)).containsExactly(BadgeCode.VOICE, BadgeCode.FOODIE, BadgeCode.PUNCTUAL);
        assertThat(codesOf(badges, PINA)).containsExactly(BadgeCode.COMPANION);           // niente vinto: compagno di viaggio
        assertThat(badges).extracting(Badge::title).contains("💰 Cassa del gruppo", "📸 Occhio da reporter", "💬 Voce del gruppo",
                "🍝 Buona forchetta", "⏱️ Conti in ordine", "❤️ Cuore del gruppo", "🧭 Giramondo", "🧳 Compagnia di viaggio");   // soprannomi neutri (D-64)
        assertThat(badges).extracting(Badge::detail).contains("ha anticipato 620,00 €", "14 foto", "31 messaggi", "ha offerto cibo per 96,00 €", "il primo saldo del viaggio", "9 reazioni ricevute", "foto in 3 luoghi", "c'era, e tanto basta");
    }

    @Test
    void pariMeritoVinceChiEEntratoPrima() {
        List<Person> people = List.of(
                person(MARCO, "Marco", true, T0.plusSeconds(60), "100.00", 5, 0, 0, "0.00", 0),
                person(VALE, "Vale", true, T0, "100.00", 5, 0, 0, "0.00", 0));
        List<Badge> badges = BadgeCalculator.compute(people, Map.of(), "EUR");
        assertThat(codesOf(badges, VALE)).containsExactly(BadgeCode.BANKER, BadgeCode.PHOTOGRAPHER);
        assertThat(codesOf(badges, MARCO)).containsExactly(BadgeCode.COMPANION);
    }

    @Test
    void esploratoreSoloConAlmenoDueLuoghiEUnaSolaPersonaHaSoloCompagno() {
        List<Badge> one = BadgeCalculator.compute(List.of(person(VALE, "Vale", true, T0, "0.00", 2, 0, 0, "0.00", 1)), Map.of(), "EUR");
        assertThat(codesOf(one, VALE)).containsExactly(BadgeCode.PHOTOGRAPHER);           // un luogo solo non fa l'esploratore
        List<Badge> none = BadgeCalculator.compute(List.of(person(VALE, "Vale", true, T0, "0.00", 0, 0, 0, "0.00", 0)), Map.of(), "EUR");
        assertThat(codesOf(none, VALE)).containsExactly(BadgeCode.COMPANION);
    }

    @Test
    void importiNellaValutaDelViaggioESingolareQuandoEUno() {
        List<Person> people = List.of(
                person(VALE, "Vale", true, T0, "2000.00", 1, 1, 1, "500.00", 0),
                person(MARCO, "Marco", true, T0.plusSeconds(60), "0.00", 0, 0, 0, "0.00", 0));
        List<Badge> badges = BadgeCalculator.compute(people, Map.of(), "JPY");
        assertThat(badges).extracting(Badge::detail)
                .contains("ha anticipato 2.000 JPY", "1 foto", "1 messaggio", "ha offerto cibo per 500 JPY", "1 reazione ricevuta");
    }
}
