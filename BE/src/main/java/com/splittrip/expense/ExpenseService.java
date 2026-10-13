package com.splittrip.expense;

import com.splittrip.common.BadRequestException;
import com.splittrip.common.ConflictException;
import com.splittrip.common.ForbiddenException;
import com.splittrip.common.NotFoundException;
import com.splittrip.expense.BalanceCalculator.ShareInput;
import com.splittrip.expense.dto.ExpenseRequest;
import com.splittrip.expense.dto.ExpenseResponse;
import com.splittrip.expense.dto.ShareRequest;
import com.splittrip.expense.dto.TrashedExpenseResponse;
import com.splittrip.trip.Trip;
import com.splittrip.trip.TripAccessService;
import com.splittrip.trip.TripMember;
import com.splittrip.trip.TripMemberRepository;
import com.splittrip.trip.TripRepository;
import com.splittrip.user.User;
import com.splittrip.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
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

    private final ExpenseRepository expenses;
    private final ExpenseShareRepository shares;
    private final ExpenseTrashRepository trash;
    private final TripRepository trips;
    private final TripMemberRepository members;
    private final TripAccessService access;
    private final UserRepository users;
    private final Clock clock;

    public ExpenseService(ExpenseRepository expenses, ExpenseShareRepository shares, ExpenseTrashRepository trash,
                          TripRepository trips, TripMemberRepository members, TripAccessService access,
                          UserRepository users, Clock clock) {
        this.expenses = expenses;
        this.shares = shares;
        this.trash = trash;
        this.trips = trips;
        this.members = members;
        this.access = access;
        this.users = users;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public List<ExpenseResponse> list(UUID tripId, UUID userId, ExpenseCategory category) {
        access.requireMember(tripId, userId);
        return expenses.findAllByTripIdWithShares(tripId).stream()
                .filter(e -> category == null || e.getCategory() == category)
                .map(ExpenseResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public ExpenseResponse get(UUID tripId, UUID userId, UUID expenseId) {
        access.requireMember(tripId, userId);
        return ExpenseResponse.from(require(tripId, expenseId));
    }

    @Transactional
    public ExpenseResponse create(UUID tripId, UUID userId, ExpenseRequest req) {
        TripMember me = access.requireMember(tripId, userId);
        Trip trip = trips.findById(tripId).orElseThrow();
        access.requireWritable(trip);
        Map<UUID, User> memberUsers = memberUsers(tripId);
        List<ShareInput> computed = computeShares(req, memberUsers);

        Expense expense = new Expense(trip, memberUsers.get(req.payerId()), req.description().strip(), req.amount(),
                req.date(), req.category(), req.splitType(), me.getUser(), clock.instant());
        for (ShareInput s : computed) {
            expense.getShares().add(new ExpenseShare(expense, memberUsers.get(s.userId()), s.amount()));
        }
        expenses.save(expense);
        return get(tripId, userId, expense.getId());
    }

    @Transactional
    public ExpenseResponse update(UUID tripId, UUID userId, UUID expenseId, ExpenseRequest req) {
        TripMember me = access.requireMember(tripId, userId);
        Trip trip = trips.findById(tripId).orElseThrow();
        access.requireWritable(trip);
        Expense expense = require(tripId, expenseId);
        requireOwnerOrOrganizer(expense, me);
        Map<UUID, User> memberUsers = memberUsers(tripId);
        List<ShareInput> computed = computeShares(req, memberUsers);

        expense.setPayer(memberUsers.get(req.payerId()));
        expense.setDescription(req.description().strip());
        expense.setAmount(req.amount());
        expense.setDate(req.date());
        expense.setCategory(req.category());
        expense.setSplitType(req.splitType());
        expense.setUpdatedAt(clock.instant());
        shares.deleteAllByExpenseId(expenseId);
        shares.flush();
        expense.getShares().clear();
        for (ShareInput s : computed) {
            expense.getShares().add(new ExpenseShare(expense, memberUsers.get(s.userId()), s.amount()));
        }
        expenses.saveAndFlush(expense);
        return get(tripId, userId, expenseId);
    }

    @Transactional
    public void delete(UUID tripId, UUID userId, UUID expenseId) {
        TripMember me = access.requireMember(tripId, userId);
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
        Map<UUID, User> memberUsers = memberUsers(tripId);
        List<UUID> involved = new ArrayList<>(trash.shareUserIds(expenseId));
        involved.addFirst(trash.payerId(expenseId));
        for (UUID userIdInvolved : involved) {
            if (!memberUsers.containsKey(userIdInvolved)) {
                String name = users.findById(userIdInvolved).map(User::getDisplayName).orElse("un ex membro");
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

    private static void requireOwnerOrOrganizer(Expense expense, TripMember me) {
        boolean owner = expense.getCreatedBy().getId().equals(me.getUser().getId());
        if (!owner && !me.isOrganizer()) {
            throw new ForbiddenException("Solo chi ha creato la spesa o l'organizzatore può modificarla");
        }
    }

    private Map<UUID, User> memberUsers(UUID tripId) {
        return members.findByTripIdOrderByJoinedAtAsc(tripId).stream()
                .map(TripMember::getUser)
                .collect(Collectors.toMap(User::getId, Function.identity(), (a, b) -> a, LinkedHashMap::new));
    }

    /** Valida pagante e partecipanti e produce le quote da salvare (anche per EQUAL). */
    static List<ShareInput> computeShares(ExpenseRequest req, Map<UUID, User> memberUsers) {
        if (!memberUsers.containsKey(req.payerId())) {
            throw new BadRequestException("Chi ha pagato deve far parte del viaggio");
        }
        List<UUID> userIds = req.shares().stream().map(ShareRequest::userId).toList();
        if (new HashSet<>(userIds).size() != userIds.size()) {
            throw new BadRequestException("Un partecipante compare più di una volta");
        }
        for (UUID id : userIds) {
            if (!memberUsers.containsKey(id)) {
                throw new BadRequestException("Tutti i partecipanti alla spesa devono far parte del viaggio");
            }
        }
        if (req.splitType() == SplitType.EQUAL) {
            return EqualSplitter.split(req.amount(), userIds);
        }
        BigDecimal sum = BigDecimal.ZERO;
        List<ShareInput> result = new ArrayList<>();
        for (ShareRequest s : req.shares()) {
            if (s.amount() == null) {
                throw new BadRequestException("Con la divisione personalizzata ogni quota deve avere un importo");
            }
            sum = sum.add(s.amount());
            result.add(new ShareInput(s.userId(), s.amount().setScale(2)));
        }
        if (sum.compareTo(req.amount()) != 0) {
            throw new BadRequestException("La somma delle quote (" + sum.setScale(2) + ") non corrisponde al totale ("
                    + req.amount().setScale(2) + ")");
        }
        return result;
    }
}
