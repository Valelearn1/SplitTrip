package com.splittrip.todo;

import com.splittrip.auth.CurrentUserId;
import com.splittrip.todo.dto.TodoItemPatchRequest;
import com.splittrip.todo.dto.TodoItemRequest;
import com.splittrip.todo.dto.TodoItemResponse;
import com.splittrip.todo.dto.TodoListPatchRequest;
import com.splittrip.todo.dto.TodoListRequest;
import com.splittrip.todo.dto.TodoListResponse;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/trips/{tripId}/todo-lists")
public class TodoController {

    private final TodoService service;

    public TodoController(TodoService service) { this.service = service; }

    @GetMapping
    @Operation(summary = "Liste del viaggio con le voci (da fare prima, poi fatte)")
    public List<TodoListResponse> lists(@CurrentUserId UUID userId, @PathVariable UUID tripId) {
        return service.lists(tripId, userId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Crea una lista (Valigia o Generale)")
    public TodoListResponse create(@CurrentUserId UUID userId, @PathVariable UUID tripId, @Valid @RequestBody TodoListRequest req) {
        return service.createList(tripId, userId, req);
    }

    @PatchMapping("/{listId}")
    @Operation(summary = "Rinomina una lista")
    public TodoListResponse rename(@CurrentUserId UUID userId, @PathVariable UUID tripId, @PathVariable UUID listId,
                                   @Valid @RequestBody TodoListPatchRequest req) {
        return service.renameList(tripId, userId, listId, req);
    }

    @DeleteMapping("/{listId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Elimina una lista e le sue voci")
    public void delete(@CurrentUserId UUID userId, @PathVariable UUID tripId, @PathVariable UUID listId) {
        service.deleteList(tripId, userId, listId);
    }

    @PostMapping("/{listId}/items")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Aggiunge una voce, eventualmente assegnata a un partecipante")
    public TodoItemResponse addItem(@CurrentUserId UUID userId, @PathVariable UUID tripId, @PathVariable UUID listId,
                                    @Valid @RequestBody TodoItemRequest req) {
        return service.addItem(tripId, userId, listId, req);
    }

    @PatchMapping("/{listId}/items/{itemId}")
    @Operation(summary = "Modifica testo, stato o assegnatario (clearAssignee=true toglie l'assegnazione)")
    public TodoItemResponse patchItem(@CurrentUserId UUID userId, @PathVariable UUID tripId, @PathVariable UUID listId,
                                      @PathVariable UUID itemId, @Valid @RequestBody TodoItemPatchRequest req) {
        return service.patchItem(tripId, userId, listId, itemId, req);
    }

    @DeleteMapping("/{listId}/items/{itemId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Elimina una voce")
    public void deleteItem(@CurrentUserId UUID userId, @PathVariable UUID tripId, @PathVariable UUID listId, @PathVariable UUID itemId) {
        service.deleteItem(tripId, userId, listId, itemId);
    }
}
