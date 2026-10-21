package com.splittrip.chat;

import com.splittrip.common.events.ExpenseCreated;
import com.splittrip.common.events.ParticipantJoined;
import com.splittrip.common.events.SettlementCreated;
import com.splittrip.trip.Participant;
import com.splittrip.trip.ParticipantRepository;
import com.splittrip.trip.TripRepository;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.time.Clock;
import java.util.UUID;

/** Gli eventi del viaggio diventano righe in chat, dopo il commit e in una transazione propria (come le notifiche, D-36). */
@Component
public class ChatEventListener {

    private final ChatMessageRepository messages;
    private final TripRepository trips;
    private final ParticipantRepository participants;
    private final ChatService chat;
    private final Clock clock;

    public ChatEventListener(ChatMessageRepository messages, TripRepository trips, ParticipantRepository participants, ChatService chat, Clock clock) {
        this.messages = messages;
        this.trips = trips;
        this.participants = participants;
        this.chat = chat;
        this.clock = clock;
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void on(ExpenseCreated e) {
        save(e.tripId(), e.actorUserId(), ChatEventType.EXPENSE_CREATED, ChatMessages.expense(e.actorName(), e.description(), e.amount(), e.currency()), e.expenseId());
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void on(SettlementCreated e) {
        // come per le spese: l'importo e la valuta di quello che è passato di mano (D-69)
        save(e.tripId(), e.actorUserId(), ChatEventType.SETTLEMENT_CREATED,
                ChatMessages.settlement(e.actorName(), e.fromName(), e.toName(), e.amount(), e.currency()), null);
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void on(ParticipantJoined e) {
        save(e.tripId(), e.joinedUserId(), ChatEventType.PARTICIPANT_JOINED, ChatMessages.joined(e.joinedName()), null);
    }

    private void save(UUID tripId, UUID actorUserId, ChatEventType type, String content, UUID refId) {
        Participant actor = actorUserId == null ? null : participants.findByTripIdAndUserIdAndLeftAtIsNull(tripId, actorUserId).orElse(null);
        ChatMessage saved = messages.save(ChatMessage.event(trips.getReferenceById(tripId), actor, type, content, refId, clock.instant()));
        chat.publishCreated(saved);
    }
}
