package com.splittrip.todo.dto;

import com.splittrip.todo.TodoItem;

import java.time.Instant;
import java.util.UUID;

public record TodoItemResponse(UUID id, String text, boolean done, UUID assigneeParticipantId, String assigneeName,
                               boolean assigneeLeft, UUID createdBy, Instant createdAt) {
    public static TodoItemResponse from(TodoItem i) {
        var a = i.getAssignee();
        return new TodoItemResponse(i.getId(), i.getText(), i.isDone(), a == null ? null : a.getId(),
                a == null ? null : a.getDisplayName(), a != null && a.hasLeft(), i.getCreatedBy().getId(), i.getCreatedAt());
    }
}
