package com.splittrip.wrapped;

import com.splittrip.chat.ChatMessageRepository;
import com.splittrip.chat.MessageReactionRepository;
import com.splittrip.common.AmountRules;
import com.splittrip.common.ConflictException;
import com.splittrip.expense.BalanceService;
import com.splittrip.expense.Expense;
import com.splittrip.expense.ExpenseRepository;
import com.splittrip.expense.SettlementRepository;
import com.splittrip.expense.dto.BalancesResponse;
import com.splittrip.home.HomeService;
import com.splittrip.photo.PhotoRepository;
import com.splittrip.trip.Participant;
import com.splittrip.trip.ParticipantRepository;
import com.splittrip.trip.Trip;
import com.splittrip.trip.TripAccessService;
import com.splittrip.trip.TripRepository;
import com.splittrip.wrapped.dto.WrappedResponse;
import com.splittrip.wrapped.dto.WrappedResponse.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;

/** Il riepilogo di fine viaggio (D-53): una query per tabella, badge dal calcolatore, ipotesi del gioco (D-54). */
@Service
public class WrappedService {

    private final TripRepository trips;
    private final ParticipantRepository participants;
    private final ExpenseRepository expenses;
    private final SettlementRepository settlements;
    private final PhotoRepository photos;
    private final ChatMessageRepository messages;
    private final MessageReactionRepository reactions;
    private final WrappedGuessRepository guesses;
    private final BalanceService balances;
    private final TripAccessService access;
    private final Clock clock;

    public WrappedService(TripRepository trips, ParticipantRepository participants, ExpenseRepository expenses, SettlementRepository settlements,
                          PhotoRepository photos, ChatMessageRepository messages, MessageReactionRepository reactions, WrappedGuessRepository guesses,
                          BalanceService balances, TripAccessService access, Clock clock) {
        this.trips = trips; this.participants = participants; this.expenses = expenses; this.settlements = settlements; this.photos = photos;
        this.messages = messages; this.reactions = reactions; this.guesses = guesses; this.balances = balances; this.access = access; this.clock = clock;
    }

    @Transactional(readOnly = true)
    public WrappedResponse get(UUID tripId, UUID userId) {
        Participant me = access.requireMember(tripId, userId);
        Trip trip = requireOpen(tripId);
        List<Participant> all = participants.findByTripIdOrderByJoinedAtAsc(tripId);
        Map<UUID, Participant> byId = new LinkedHashMap<>();
        all.forEach(p -> byId.put(p.getId(), p));
        Map<UUID, UUID> participantByUser = new HashMap<>();
        all.stream().filter(Participant::hasAccount).forEach(p -> participantByUser.put(p.userId(), p.getId()));

        // spese attive (la query esclude il cestino)
        List<Expense> active = expenses.findAllByTripIdWithShares(tripId);
        BigDecimal groupTotal = active.stream().map(Expense::getAmountBase).reduce(BigDecimal.ZERO, BigDecimal::add);
        Map<String, BigDecimal> byCat = new LinkedHashMap<>();
        Map<LocalDate, BigDecimal> byDay = new HashMap<>();
        Map<UUID, BigDecimal> paid = new HashMap<>(), foodPaid = new HashMap<>();
        Set<UUID> withShare = new HashSet<>();
        Expense biggest = null;
        for (Expense e : active) {
            byCat.merge(e.getCategory().name(), e.getAmountBase(), BigDecimal::add);
            byDay.merge(e.getDate(), e.getAmountBase(), BigDecimal::add);
            paid.merge(e.getPayer().getId(), e.getAmountBase(), BigDecimal::add);
            if (e.getCategory().name().equals("FOOD")) foodPaid.merge(e.getPayer().getId(), e.getAmountBase(), BigDecimal::add);
            e.getShares().forEach(s -> withShare.add(s.getParticipant().getId()));
            if (biggest == null || e.getAmountBase().compareTo(biggest.getAmountBase()) > 0) biggest = e;
        }
        List<Map.Entry<String, BigDecimal>> ordered = byCat.entrySet().stream().sorted(Map.Entry.<String, BigDecimal>comparingByValue().reversed()).toList();
        List<Integer> shares = percentages(ordered.stream().map(Map.Entry::getValue).toList(), groupTotal);
        List<Category> categories = new ArrayList<>();
        for (int i = 0; i < ordered.size(); i++) categories.add(new Category(ordered.get(i).getKey(), money(ordered.get(i).getValue()), shares.get(i)));
        Day priciest = byDay.entrySet().stream().max(Map.Entry.comparingByValue()).map(en -> new Day(en.getKey(), money(en.getValue()))).orElse(null);
        Biggest record = biggest == null ? null : new Biggest(biggest.getDescription(), money(biggest.getAmountBase()), biggest.getPayer().getDisplayName());

        // foto: momenti (prima quelle con luogo), conteggi e luoghi per persona
        List<Object[]> photoRows = photos.findWrappedRows(tripId);
        Map<UUID, Integer> photoCount = new HashMap<>();
        Map<UUID, Set<String>> places = new HashMap<>();
        for (Object[] r : photoRows) {
            UUID pid = participantByUser.get((UUID) r[0]);
            if (pid == null) continue;
            photoCount.merge(pid, 1, Integer::sum);
            if (r[1] != null) places.computeIfAbsent(pid, k -> new HashSet<>()).add((String) r[1]);
        }
        List<Moment> moments = photoRows.stream()
                .sorted(Comparator.comparing((Object[] r) -> r[1] == null).thenComparing(r -> (Instant) r[2], Comparator.reverseOrder()))
                .limit(6)
                .map(r -> new Moment((UUID) r[3], (String) r[4], (String) r[1], (BigDecimal) r[5], (BigDecimal) r[6]))
                .toList();
        UUID latest = photoRows.isEmpty() ? null : (UUID) photoRows.getFirst()[3];
        UUID cover = trip.getCoverPhotoId() != null ? trip.getCoverPhotoId() : latest;   // la copertina scelta, altrimenti l'ultima (D-71)

        Map<UUID, Integer> msgCount = new HashMap<>();
        for (Object[] r : messages.countTextByAuthor(tripId)) msgCount.put((UUID) r[0], ((Long) r[1]).intValue());
        Map<UUID, Integer> reactCount = new HashMap<>();
        for (Object[] r : reactions.countReceivedByAuthor(tripId)) reactCount.put((UUID) r[0], ((Long) r[1]).intValue());
        Map<UUID, Instant> firstSettlement = new HashMap<>();
        for (Object[] r : settlements.firstSettlementByPayer(tripId)) firstSettlement.put((UUID) r[0], (Instant) r[1]);

        List<Person> people = all.stream().map(p -> new Person(p.getId(), p.getDisplayName(), p.hasAccount(), p.userId(), p.getJoinedAt(),
                money(paid.getOrDefault(p.getId(), BigDecimal.ZERO)), photoCount.getOrDefault(p.getId(), 0), msgCount.getOrDefault(p.getId(), 0),
                reactCount.getOrDefault(p.getId(), 0), money(foodPaid.getOrDefault(p.getId(), BigDecimal.ZERO)), places.getOrDefault(p.getId(), Set.of()).size())).toList();

        BalancesResponse bal = balances.computeBalances(tripId);
        boolean settled = bal.balances().stream().allMatch(b -> b.net().signum() == 0);
        int nights = (int) ChronoUnit.DAYS.between(trip.getStartDate(), trip.getEndDate());
        int sharers = Math.max(1, withShare.size());
        return new WrappedResponse(
                new WrappedResponse.Trip(trip.getId(), trip.getName(), trip.getDestination(), trip.getStartDate(), trip.getEndDate(), nights, all.size(), trip.getCurrency(), cover),
                new Totals(money(groupTotal), active.isEmpty() ? money(BigDecimal.ZERO) : groupTotal.divide(BigDecimal.valueOf(sharers), 2, RoundingMode.HALF_UP),
                        active.size(), photoRows.size(), msgCount.values().stream().mapToInt(Integer::intValue).sum(), reactCount.values().stream().mapToInt(Integer::intValue).sum()),
                categories, record, priciest, moments, people, BadgeCalculator.compute(people, firstSettlement, trip.getCurrency()),
                new Settlement(settled, bal.suggestedTransfers().size()), guess(tripId, me.getId(), byId, groupTotal));
    }

    @Transactional
    public void guess(UUID tripId, UUID userId, BigDecimal amount) {
        Participant me = access.requireMember(tripId, userId);
        Trip trip = requireOpen(tripId);
        AmountRules.check("amount", amount, trip.getCurrency());   // D-70: il tetto della valuta del viaggio
        if (guesses.insertIfAbsent(tripId, me.getId(), amount.setScale(2, RoundingMode.HALF_UP), clock.instant()) == 0) {
            throw new ConflictException("Hai già dato la tua ipotesi");
        }
    }

    private Trip requireOpen(UUID tripId) {
        Trip trip = trips.findById(tripId).orElseThrow();
        if (!HomeService.isOver(trip.getStatus(), trip.getEndDate(), LocalDate.now(clock))) throw new ConflictException("Il riepilogo arriva a fine viaggio");
        return trip;
    }

    /** Le ipotesi altrui si vedono solo dopo aver dato la propria (D-54). */
    private Guess guess(UUID tripId, UUID myParticipantId, Map<UUID, Participant> byId, BigDecimal groupTotal) {
        List<Object[]> rows = guesses.findByTripId(tripId);
        BigDecimal mine = rows.stream().filter(r -> r[0].equals(myParticipantId)).map(r -> money((BigDecimal) r[1])).findFirst().orElse(null);
        if (mine == null) return new Guess(null, rows.size(), null);
        List<GuessEntry> others = rows.stream()
                .map(r -> new GuessEntry((UUID) r[0], byId.get((UUID) r[0]).getDisplayName(), money((BigDecimal) r[1]), money(((BigDecimal) r[1]).subtract(groupTotal).abs())))
                .sorted(Comparator.comparing(GuessEntry::diff))
                .toList();
        return new Guess(mine, rows.size(), others);
    }

    /** Percentuali intere che sommano 100 (resto maggiore, come le quote): a parità vince l'ordine. */
    static List<Integer> percentages(List<BigDecimal> amounts, BigDecimal total) {
        if (total.signum() == 0) return amounts.stream().map(a -> 0).toList();
        List<BigDecimal> exact = amounts.stream().map(a -> a.multiply(BigDecimal.valueOf(100)).divide(total, 6, RoundingMode.DOWN)).toList();
        int[] floor = exact.stream().mapToInt(BigDecimal::intValue).toArray();
        int missing = 100 - Arrays.stream(floor).sum();
        List<Integer> order = java.util.stream.IntStream.range(0, exact.size()).boxed()
                .sorted((i, j) -> exact.get(j).remainder(BigDecimal.ONE).compareTo(exact.get(i).remainder(BigDecimal.ONE))).toList();
        for (int k = 0; k < missing && k < order.size(); k++) floor[order.get(k)]++;
        return Arrays.stream(floor).boxed().toList();
    }

    private static BigDecimal money(BigDecimal v) { return v.setScale(2, RoundingMode.HALF_UP); }
}
