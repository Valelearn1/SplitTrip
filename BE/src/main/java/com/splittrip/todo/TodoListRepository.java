package com.splittrip.todo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TodoListRepository extends JpaRepository<TodoList, UUID> {

    @Query("""
            select distinct l from TodoList l
            left join fetch l.items i
            left join fetch i.assignee
            where l.trip.id = :tripId
            order by l.createdAt
            """)
    List<TodoList> findAllByTripIdWithItems(UUID tripId);

    Optional<TodoList> findByIdAndTripId(UUID id, UUID tripId);
}
