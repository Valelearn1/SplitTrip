package com.splittrip.todo;

import com.splittrip.common.BadRequestException;
import com.splittrip.common.NotFoundException;
import com.splittrip.common.events.TodoAssigned;
import com.splittrip.todo.dto.TodoItemPatchRequest;
import com.splittrip.todo.dto.TodoItemRequest;
import com.splittrip.todo.dto.TodoItemResponse;
import com.splittrip.todo.dto.TodoListPatchRequest;
import com.splittrip.todo.dto.TodoListRequest;
import com.splittrip.todo.dto.TodoListResponse;
import com.splittrip.trip.Participant;
import com.splittrip.trip.ParticipantRepository;
import com.splittrip.trip.Trip;
import com.splittrip.trip.TripAccessService;
import com.splittrip.trip.TripRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

/** Liste condivise del viaggio (D-34). Spuntare resta permesso anche a viaggio chiuso: non tocca i soldi. */
@Service
public class TodoService {

    private final TodoListRepository lists;
    private final TodoItemRepository items;
    private final TripRepository trips;
    private final ParticipantRepository participants;
    private final TripAccessService access;
    private final ApplicationEventPublisher events;
    private final Clock clock;

    public TodoService(TodoListRepository lists, TodoItemRepository items, TripRepository trips,
                       ParticipantRepository participants, TripAccessService access,
                       ApplicationEventPublisher events, Clock clock) {
        this.lists = lists;
        this.items = items;
        this.trips = trips;
        this.participants = participants;
        this.access = access;
        this.events = events;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public List<TodoListResponse> lists(UUID tripId, UUID userId) {
        access.requireMember(tripId, userId);
        return lists.findAllByTripIdWithItems(tripId).stream().map(TodoListResponse::from).toList();
    }

    @Transactional
    public TodoListResponse createList(UUID tripId, UUID userId, TodoListRequest req) {
        Participant me = access.requireMember(tripId, userId);
        Trip trip = trips.findById(tripId).orElseThrow();
        access.requireWritable(trip);
        return TodoListResponse.from(lists.save(new TodoList(trip, req.title().strip(), req.type(), me.getUser(), clock.instant())));
    }

    @Transactional
    public TodoListResponse renameList(UUID tripId, UUID userId, UUID listId, TodoListPatchRequest req) {
        access.requireMember(tripId, userId);
        TodoList list = requireList(tripId, listId);
        if (req.title() != null) list.setTitle(req.title().strip());
        return TodoListResponse.from(list);
    }

    @Transactional
    public void deleteList(UUID tripId, UUID userId, UUID listId) {
        access.requireMember(tripId, userId);
        access.requireWritable(trips.findById(tripId).orElseThrow());
        lists.delete(requireList(tripId, listId));
    }

    @Transactional
    public TodoItemResponse addItem(UUID tripId, UUID userId, UUID listId, TodoItemRequest req) {
        Participant me = access.requireMember(tripId, userId);
        access.requireWritable(trips.findById(tripId).orElseThrow());
        TodoList list = requireList(tripId, listId);
        Participant assignee = req.assigneeParticipantId() == null ? null : resolveAssignee(tripId, req.assigneeParticipantId());
        TodoItem item = new TodoItem(list, req.text().strip(), assignee, me.getUser(), clock.instant());
        list.getItems().add(item);
        items.save(item);
        notifyAssignee(tripId, list, item, me, null);
        return TodoItemResponse.from(item);
    }

    @Transactional
    public TodoItemResponse patchItem(UUID tripId, UUID userId, UUID listId, UUID itemId, TodoItemPatchRequest req) {
        Participant me = access.requireMember(tripId, userId);
        TodoList list = requireList(tripId, listId);
        TodoItem item = items.findByIdAndListId(itemId, listId).orElseThrow(() -> new NotFoundException("Voce non trovata"));
        Participant before = item.getAssignee();
        if (req.text() != null) item.setText(req.text().strip());
        if (req.done() != null) item.setDone(req.done());
        if (Boolean.TRUE.equals(req.clearAssignee())) {
            item.setAssignee(null);
        } else if (req.assigneeParticipantId() != null) {
            item.setAssignee(resolveAssignee(tripId, req.assigneeParticipantId()));
        }
        item.setUpdatedAt(clock.instant());
        notifyAssignee(tripId, list, item, me, before);
        return TodoItemResponse.from(item);
    }

    @Transactional
    public void deleteItem(UUID tripId, UUID userId, UUID listId, UUID itemId) {
        access.requireMember(tripId, userId);
        access.requireWritable(trips.findById(tripId).orElseThrow());
        TodoList list = requireList(tripId, listId);
        TodoItem item = items.findByIdAndListId(itemId, listId).orElseThrow(() -> new NotFoundException("Voce non trovata"));
        list.getItems().remove(item);
    }

    private TodoList requireList(UUID tripId, UUID listId) {
        return lists.findByIdAndTripId(listId, tripId).orElseThrow(() -> new NotFoundException("Lista non trovata"));
    }

    private Participant resolveAssignee(UUID tripId, UUID participantId) {
        return participants.findByIdAndTripId(participantId, tripId)
                .filter(p -> !p.hasLeft())
                .orElseThrow(() -> new BadRequestException("L'assegnatario deve far parte del viaggio"));
    }

    /** Notifica solo se l'assegnatario è nuovo e ha un account (D-36). */
    private void notifyAssignee(UUID tripId, TodoList list, TodoItem item, Participant me, Participant before) {
        Participant now = item.getAssignee();
        if (now == null || !now.hasAccount() || Objects.equals(before == null ? null : before.getId(), now.getId())) return;
        events.publishEvent(new TodoAssigned(tripId, list.getId(), me.userId(), me.getDisplayName(), now.userId(),
                item.getText(), list.getTitle()));
    }
}
