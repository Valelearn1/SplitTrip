package com.splittrip.todo.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record TodoListPatchRequest(@Pattern(regexp = ".*\\S.*", message = "non può essere vuoto") @Size(max = 60) String title) {}
