package com.splittrip.todo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record TodoItemRequest(@NotBlank @Size(max = 120) String text, UUID assigneeParticipantId) {}
