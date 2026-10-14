package com.splittrip.todo.dto;

import com.splittrip.todo.TodoListType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record TodoListRequest(@NotBlank @Size(max = 60) String title, @NotNull TodoListType type) {}
