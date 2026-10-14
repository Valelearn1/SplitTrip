package com.splittrip.todo;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface TodoItemRepository extends JpaRepository<TodoItem, UUID> {
    Optional<TodoItem> findByIdAndListId(UUID id, UUID listId);
}
