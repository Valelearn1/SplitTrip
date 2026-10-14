package com.splittrip.todo;

import com.splittrip.trip.Trip;
import com.splittrip.user.User;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "todo_lists")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class TodoList {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "trip_id") private Trip trip;
    @Setter @Column(nullable = false, length = 60) private String title;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 16) private TodoListType type;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "created_by") private User createdBy;
    @Column(name = "created_at", nullable = false) private Instant createdAt;

    @OneToMany(mappedBy = "list", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TodoItem> items = new ArrayList<>();

    public TodoList(Trip trip, String title, TodoListType type, User createdBy, Instant now) {
        this.trip = trip;
        this.title = title;
        this.type = type;
        this.createdBy = createdBy;
        this.createdAt = now;
    }
}
