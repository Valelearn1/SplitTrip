package com.splittrip.todo.dto;

import com.splittrip.todo.TodoItem;
import com.splittrip.todo.TodoList;
import com.splittrip.todo.TodoListType;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

public record TodoListResponse(UUID id, String title, TodoListType type, Instant createdAt, List<TodoItemResponse> items) {
    /** Voci da fare prima, poi le fatte; dentro ciascun gruppo in ordine di creazione. */
    public static TodoListResponse from(TodoList l) {
        return new TodoListResponse(l.getId(), l.getTitle(), l.getType(), l.getCreatedAt(),
                l.getItems().stream()
                        .sorted(Comparator.comparing(TodoItem::isDone).thenComparing(TodoItem::getCreatedAt))
                        .map(TodoItemResponse::from).toList());
    }
}
