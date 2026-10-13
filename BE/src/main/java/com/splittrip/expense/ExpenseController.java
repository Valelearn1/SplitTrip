package com.splittrip.expense;

import com.splittrip.auth.CurrentUserId;
import com.splittrip.expense.dto.ExpenseRequest;
import com.splittrip.expense.dto.ExpenseResponse;
import com.splittrip.expense.dto.TrashedExpenseResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/trips/{tripId}/expenses")
public class ExpenseController {

    private final ExpenseService service;

    public ExpenseController(ExpenseService service) { this.service = service; }

    @GetMapping
    public List<ExpenseResponse> list(@CurrentUserId UUID userId, @PathVariable UUID tripId,
                                      @RequestParam(required = false) ExpenseCategory category) {
        return service.list(tripId, userId, category);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ExpenseResponse create(@CurrentUserId UUID userId, @PathVariable UUID tripId,
                                  @Valid @RequestBody ExpenseRequest req) {
        return service.create(tripId, userId, req);
    }

    @GetMapping("/trash")
    public List<TrashedExpenseResponse> trash(@CurrentUserId UUID userId, @PathVariable UUID tripId) {
        return service.trash(tripId, userId);
    }

    @GetMapping("/{expenseId}")
    public ExpenseResponse get(@CurrentUserId UUID userId, @PathVariable UUID tripId, @PathVariable UUID expenseId) {
        return service.get(tripId, userId, expenseId);
    }

    @PutMapping("/{expenseId}")
    public ExpenseResponse update(@CurrentUserId UUID userId, @PathVariable UUID tripId, @PathVariable UUID expenseId,
                                  @Valid @RequestBody ExpenseRequest req) {
        return service.update(tripId, userId, expenseId, req);
    }

    @DeleteMapping("/{expenseId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@CurrentUserId UUID userId, @PathVariable UUID tripId, @PathVariable UUID expenseId) {
        service.delete(tripId, userId, expenseId);
    }

    @PostMapping("/{expenseId}/restore")
    public ExpenseResponse restore(@CurrentUserId UUID userId, @PathVariable UUID tripId, @PathVariable UUID expenseId) {
        return service.restore(tripId, userId, expenseId);
    }
}
