package com.splittrip.todo;

import com.splittrip.trip.Participant;
import com.splittrip.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "todo_items")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class TodoItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "list_id") private TodoList list;
    @Setter @Column(nullable = false, length = 120) private String text;
    @Setter @Column(nullable = false) private boolean done;
    /** Partecipante, anche senza account (D-34); null = nessuno. */
    @Setter @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "assignee_participant_id") private Participant assignee;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "created_by") private User createdBy;
    @Column(name = "created_at", nullable = false) private Instant createdAt;
    @Setter @Column(name = "updated_at", nullable = false) private Instant updatedAt;

    public TodoItem(TodoList list, String text, Participant assignee, User createdBy, Instant now) {
        this.list = list;
        this.text = text;
        this.assignee = assignee;
        this.createdBy = createdBy;
        this.createdAt = now;
        this.updatedAt = now;
    }
}
