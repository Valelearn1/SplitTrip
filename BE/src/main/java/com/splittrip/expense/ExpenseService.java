package com.splittrip.expense;

import com.splittrip.common.BadRequestException;
import com.splittrip.common.ConflictException;
import com.splittrip.common.FieldException;
import com.splittrip.common.ForbiddenException;
import com.splittrip.common.NotFoundException;
import com.splittrip.common.events.ExpenseCreated;
import com.splittrip.expense.dto.ExpenseRequest;
import com.splittrip.expense.dto.ExpenseResponse;
import com.splittrip.expense.dto.ShareRequest;
import com.splittrip.expense.dto.TrashedExpenseResponse;
import com.splittrip.photo.PhotoRepository;
import com.splittrip.trip.Participant;
import com.splittrip.trip.ParticipantRepository;
import com.splittrip.trip.Trip;
import com.splittrip.trip.TripAccessService;
import com.splittrip.trip.TripRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Clock;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class ExpenseService {

    /** Quota pronta da salvare: importo calcolato e input da cui deriva (peso o notti/giorni, null per EQUAL e CUSTOM). */
    record ComputedShare(UUID participantId, BigDecimal amount, BigDecimal weight) {}

    private final ExpenseRepository expenses;
    private final ExpenseShareRepository shares;
    private final ExpenseTrashRepository trash;
    private final TripRepository trips;
    private final ParticipantRepository participants;
    private final TripAccessService access;
    private final PhotoRepository photos;
    private final ApplicationEventPublisher events;
    private final Clock clock;

    public ExpenseService(ExpenseRepository expenses, ExpenseShareRepository shares, ExpenseTrashRepository trash,
                          TripRepository trips, ParticipantRepository participants, TripAccessService access,
                          PhotoRepository photos, ApplicationEventPublisher events, Clock clock) {
        this.expenses = expenses;
        this.shares = shares;
        this.trash = trash;
        this.trips = trips;
        this.participants = participants;
        this.access = access;
        this.photos = photos;
        this.events = events;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public List<ExpenseResponse> list(UUID tripId, UUID userId, ExpenseCategory category) {
        access.requireMember(tripId, userId);
        Map<UUID, UUID> receipts = photos.findReceiptIdsByTripId(tripId);
        return expenses.findAllByTripIdWithShares(tripId).stream()
                .filter(e -> category == null || e.getCategory() == category)
                .map(e -> ExpenseResponse.from(e, receipts.get(e.getId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public ExpenseResponse get(UUID tripId, UUID userId, UUID expenseId) {
        access.requireMember(tripId, userId);
        return ExpenseResponse.from(require(tripId, expenseId), photos.findReceiptIdsByTripId(tripId).get(expenseId));
    }

    @Transactional
    public ExpenseResponse create(UUID tripId, UUID userId, ExpenseRequest req) {
        Participant me = access.requireMember(tripId, userId);
        Trip trip = trips.findById(tripId).orElseThrow();
        access.requireWritable(trip);
        Map<UUID, Participant> active = activeParticipants(tripId);
        List<ComputedShare> computed = computeShares(req, active);

        Expense expense = new Expense(trip, active.get(req.payerId()), req.description().strip(), req.amount(),
                req.date(), req.category(), req.splitType(), req.dayBasis(), me.getUser(), clock.instant());
        for (ComputedShare s : computed) {
            expense.getShares().add(new ExpenseShare(expense, active.get(s.participantId()), s.amount(), s.weight()));
        }
        expenses.save(expense);
        // solo chi ha un account riceve la notifica (D-36)
        Map<UUID, BigDecimal> shareByUserId = new LinkedHashMap<>();
        for (ExpenseShare s : expense.getShares()) {
            if (s.getParticipant().hasAccount()) shareByUserId.put(s.getParticipant().userId(), s.getAmount());
        }
        events.publishEvent(new ExpenseCreated(tripId, expense.getId(), userId, me.getDisplayName(), expense.getDescription(), shareByUserId));
        return get(tripId, userId, expense.getId());
    }

    @Transactional
    public ExpenseResponse update(UUID tripId, UUID userId, UUID expenseId, ExpenseRequest req) {
        Participant me = access.requireMember(tripId, userId);
        Trip trip = trips.findById(tripId).orElseThrow();
        access.requireWritable(trip);
        Expense expense = require(tripId, expenseId);
        requireOwnerOrOrganizer(expense, me);
        Map<UUID, Participant> active = activeParticipants(tripId);
        List<ComputedShare> computed = computeShares(req, active);

        expense.setPayer(active.get(req.payerId()));
        expense.setDescription(req.description().strip());
        expense.setAmount(req.amount());
        expense.setDate(req.date());
        expense.setCategory(req.category());
        expense.setSplitType(req.splitType());
        expense.setDayBasis(req.dayBasis());
        expense.setUpdatedAt(clock.instant());
        shares.deleteAllByExpenseId(expenseId);
        shares.flush();
        expense.getShares().clear();
        for (ComputedShare s : computed) {
            expense.getShares().add(new ExpenseShare(expense, active.get(s.participantId()), s.amount(), s.weight()));
        }
        expenses.saveAndFlush(expense);
        return get(tripId, userId, expenseId);
    }

    @Transactional
    public void delete(UUID tripId, UUID userId, UUID expenseId) {
        Participant me = access.requireMember(tripId, userId);
        access.requireWritable(trips.findById(tripId).orElseThrow());
        // Caricata senza quote: con le quote in sessione Hibernate rifiuterebbe la rimozione del padre
        Expense expense = expenses.findByIdAndTripId(expenseId, tripId)
                .orElseThrow(() -> new NotFoundException("Spesa non trovata"));
        requireOwnerOrOrganizer(expense, me);
        expenses.delete(expense); // soft delete: UPDATE expenses SET deleted_at = now()
    }

    @Transactional(readOnly = true)
    public List<TrashedExpenseResponse> trash(UUID tripId, UUID userId) {
        access.requireOrganizer(tripId, userId);
        return trash.findTrashed(tripId);
    }

    @Transactional
    public ExpenseResponse restore(UUID tripId, UUID userId, UUID expenseId) {
        access.requireOrganizer(tripId, userId);
        access.requireWritable(trips.findById(tripId).orElseThrow());
        if (!trash.isTrashed(tripId, expenseId)) {
            throw new NotFoundException("Spesa non trovata nel cestino");
        }
        List<UUID> involved = new ArrayList<>(trash.shareParticipantIds(expenseId));
        involved.addFirst(trash.payerParticipantId(expenseId));
        for (UUID participantId : involved) {
            Participant p = participants.findById(participantId).orElse(null);
            if (p == null || p.hasLeft()) {
                String name = p == null ? "un ex membro" : p.getDisplayName();
                throw new ConflictException("Non si può ripristinare: " + name + " non fa più parte del viaggio");
            }
        }
        trash.restore(tripId, expenseId);
        return get(tripId, userId, expenseId);
    }

    private Expense require(UUID tripId, UUID expenseId) {
        return expenses.findByIdAndTripIdWithShares(expenseId, tripId)
                .orElseThrow(() -> new NotFoundException("Spesa non trovata"));
    }

    private static void requireOwnerOrOrganizer(Expense expense, Participant me) {
        boolean owner = expense.getCreatedBy().getId().equals(me.userId());
        if (!owner && !me.isOrganizer()) {
            throw new ForbiddenException("Solo chi ha creato la spesa o l'organizzatore può modificarla");
        }
    }

    private Map<UUID, Participant> activeParticipants(UUID tripId) {
        return participants.findByTripIdAndLeftAtIsNullOrderByJoinedAtAsc(tripId).stream()
                .collect(Collectors.toMap(Participant::getId, Function.identity(), (a, b) -> a, LinkedHashMap::new));
    }

    /** Valida pagante e partecipanti e produce le quote da salvare (anche per EQUAL). */
    static List<ComputedShare> computeShares(ExpenseRequest req, Map<UUID, Participant> active) {
        if (!active.containsKey(req.payerId())) {
            throw new BadRequestException("Chi ha pagato deve far parte del viaggio");
        }
        List<UUID> ids = req.shares().stream().map(ShareRequest::participantId).toList();
        if (new HashSet<>(ids).size() != ids.size()) {
            throw new BadRequestException("Un partecipante compare più di una volta");
        }
        for (UUID id : ids) {
            if (!active.containsKey(id)) {
                throw new BadRequestException("Tutti i partecipanti alla spesa devono far parte del viaggio");
            }
        }
        if ((req.splitType() == SplitType.DAYS) != (req.dayBasis() != null)) {
            throw new FieldException("dayBasis", "Indica se contare notti o giorni (solo con la divisione per presenza)");
        }
        if (req.splitType() == SplitType.WEIGHT || req.splitType() == SplitType.DAYS) {
            Map<UUID, BigDecimal> weights = new LinkedHashMap<>();
            for (int i = 0; i < req.shares().size(); i++) {
                ShareRequest s = req.shares().get(i);
                if (s.weight() == null) {
                    throw new FieldException("shares[" + i + "].weight", req.splitType() == SplitType.DAYS
                            ? "Indica le notti o i giorni di ogni partecipante" : "Indica il peso di ogni partecipante");
                }
                weights.put(s.participantId(), s.weight().setScale(2, RoundingMode.HALF_UP));
            }
            return WeightedSplitter.split(req.amount(), weights).stream()
                    .map(sh -> new ComputedShare(sh.participantId(), sh.amount(), weights.get(sh.participantId())))
                    .toList();
        }
        for (int i = 0; i < req.shares().size(); i++) {
            if (req.shares().get(i).weight() != null) {
                throw new FieldException("shares[" + i + "].weight", "Il peso si usa solo con la divisione per peso o per presenza");
            }
        }
        if (req.splitType() == SplitType.EQUAL) {
            return EqualSplitter.split(req.amount(), ids).stream()
                    .map(s -> new ComputedShare(s.participantId(), s.amount(), null))
                    .toList();
        }
        BigDecimal sum = BigDecimal.ZERO;
        List<ComputedShare> result = new ArrayList<>();
        for (ShareRequest s : req.shares()) {
            if (s.amount() == null) {
                throw new BadRequestException("Con la divisione personalizzata ogni quota deve avere un importo");
            }
            sum = sum.add(s.amount());
            result.add(new ComputedShare(s.participantId(), s.amount().setScale(2, RoundingMode.HALF_UP), null));
        }
        if (sum.compareTo(req.amount()) != 0) {
            throw new BadRequestException("La somma delle quote (" + sum.setScale(2, RoundingMode.HALF_UP)
                    + ") non corrisponde al totale (" + req.amount().setScale(2, RoundingMode.HALF_UP) + ")");
        }
        return result;
    }
}
