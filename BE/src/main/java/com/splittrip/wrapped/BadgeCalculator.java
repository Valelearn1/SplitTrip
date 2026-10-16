package com.splittrip.wrapped;

import com.splittrip.wrapped.dto.WrappedResponse.Badge;
import com.splittrip.wrapped.dto.WrappedResponse.BadgeCode;
import com.splittrip.wrapped.dto.WrappedResponse.Person;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;

/** Badge di fine viaggio (D-55): almeno uno a testa, pari merito a chi è entrato prima, zero non vince. Puro: niente Spring. */
public final class BadgeCalculator {

    private BadgeCalculator() {}

    private static final NumberFormat MONEY = NumberFormat.getNumberInstance(Locale.ITALY);
    static { MONEY.setMinimumFractionDigits(2); MONEY.setMaximumFractionDigits(2); }

    public static List<Badge> compute(List<Person> people, Map<UUID, Instant> firstSettlementAt) {
        List<Badge> out = new ArrayList<>();
        Set<UUID> winners = new HashSet<>();
        award(out, winners, people, BadgeCode.BANKER, "💰 Il banchiere", Person::paid, p -> "ha anticipato " + MONEY.format(p.paid()));
        award(out, winners, people, BadgeCode.PHOTOGRAPHER, "📸 Il fotografo", p -> BigDecimal.valueOf(p.photos()), p -> p.photos() + " foto");
        award(out, winners, people, BadgeCode.VOICE, "💬 La voce del gruppo", p -> BigDecimal.valueOf(p.messages()), p -> p.messages() + " messaggi");
        award(out, winners, people, BadgeCode.FOODIE, "🍝 Il buongustaio", Person::foodPaid, p -> "ha offerto cibo per " + MONEY.format(p.foodPaid()));
        firstSettlementAt.entrySet().stream().min(Map.Entry.comparingByValue()).map(Map.Entry::getKey)
                .flatMap(id -> people.stream().filter(p -> p.participantId().equals(id)).findFirst())
                .ifPresent(p -> { out.add(new Badge(p.participantId(), BadgeCode.PUNCTUAL, "⏱️ Il puntuale", "primo a saldare")); winners.add(p.participantId()); });
        award(out, winners, people, BadgeCode.LOVED, "❤️ Il più amato", p -> BigDecimal.valueOf(p.reactionsReceived()), p -> p.reactionsReceived() + " reazioni ricevute");
        // l'esploratore serve almeno due luoghi: un luogo solo è una foto con un nome
        award(out, winners, people, BadgeCode.EXPLORER, "🧭 L'esploratore", p -> BigDecimal.valueOf(p.places() >= 2 ? p.places() : 0), p -> "foto in " + p.places() + " luoghi");
        for (Person p : people) {
            if (!winners.contains(p.participantId())) out.add(new Badge(p.participantId(), BadgeCode.COMPANION, "🧳 Compagno di viaggio", "c'era, e tanto basta"));
        }
        // ordine stabile: per persona nell'ordine d'ingresso, poi per codice
        List<UUID> order = people.stream().sorted(Comparator.comparing(Person::joinedAt)).map(Person::participantId).toList();
        out.sort(Comparator.<Badge>comparingInt(b -> order.indexOf(b.participantId())).thenComparing(b -> b.code().ordinal()));
        return out;
    }

    private static void award(List<Badge> out, Set<UUID> winners, List<Person> people, BadgeCode code, String title,
                              Function<Person, BigDecimal> value, Function<Person, String> detail) {
        Optional<Person> best = people.stream()
                .filter(p -> value.apply(p).signum() > 0)
                .max(Comparator.comparing(value).thenComparing(Person::joinedAt, Comparator.reverseOrder())); // a pari valore vince joinedAt minore
        best.ifPresent(p -> { out.add(new Badge(p.participantId(), code, title, detail.apply(p))); winners.add(p.participantId()); });
    }
}
