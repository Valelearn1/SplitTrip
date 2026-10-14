package com.splittrip.notification;

import com.splittrip.common.events.ExpenseCreated;
import com.splittrip.common.events.ParticipantJoined;
import com.splittrip.common.events.SettlementCreated;
import com.splittrip.common.events.TodoAssigned;
import com.splittrip.trip.TripRepository;
import com.splittrip.user.UserRepository;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.time.Clock;
import java.util.Objects;
import java.util.UUID;

/**
 * Trasforma gli eventi interni in notifiche, dopo il commit e in una transazione propria:
 * se la notifica fallisce, l'operazione originale resta valida (D-36). Chi agisce non riceve mai la propria.
 */
@Component
public class NotificationListener {

    private final NotificationRepository notifications;
    private final UserRepository users;
    private final TripRepository trips;
    private final Clock clock;

    public NotificationListener(NotificationRepository notifications, UserRepository users, TripRepository trips, Clock clock) {
        this.notifications = notifications;
        this.users = users;
        this.trips = trips;
        this.clock = clock;
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void on(ExpenseCreated e) {
        String link = "/trips/" + e.tripId() + "/expenses/" + e.expenseId() + "/edit";
        e.shareByUserId().forEach((userId, share) -> {
            if (!userId.equals(e.actorUserId())) {
                save(userId, e.tripId(), NotificationType.EXPENSE_ADDED,
                        NotificationMessages.expense(e.actorName(), e.description(), share), link);
            }
        });
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void on(SettlementCreated e) {
        String link = "/trips/" + e.tripId() + "/balances";
        if (e.toUserId() != null && !e.toUserId().equals(e.actorUserId())) {
            save(e.toUserId(), e.tripId(), NotificationType.SETTLEMENT_ADDED,
                    NotificationMessages.settlement(e.actorName(), e.amount(), true, e.fromName()), link);
        }
        if (e.fromUserId() != null && !e.fromUserId().equals(e.actorUserId())) {
            save(e.fromUserId(), e.tripId(), NotificationType.SETTLEMENT_ADDED,
                    NotificationMessages.settlement(e.actorName(), e.amount(), false, e.toName()), link);
        }
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void on(ParticipantJoined e) {
        e.recipientUserIds().stream()
                .filter(id -> !Objects.equals(id, e.joinedUserId()))
                .forEach(id -> save(id, e.tripId(), NotificationType.PARTICIPANT_JOINED,
                        NotificationMessages.joined(e.joinedName()), "/trips/" + e.tripId()));
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void on(TodoAssigned e) {
        if (e.assigneeUserId() != null && !e.assigneeUserId().equals(e.actorUserId())) {
            save(e.assigneeUserId(), e.tripId(), NotificationType.TODO_ASSIGNED,
                    NotificationMessages.todo(e.actorName(), e.itemText(), e.listTitle()), "/trips/" + e.tripId() + "/lists");
        }
    }

    private void save(UUID userId, UUID tripId, NotificationType type, String message, String link) {
        notifications.save(new Notification(users.getReferenceById(userId), trips.getReferenceById(tripId), type, message, link, clock.instant()));
    }
}
