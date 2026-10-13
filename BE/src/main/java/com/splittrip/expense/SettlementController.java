package com.splittrip.expense;

import com.splittrip.auth.CurrentUserId;
import com.splittrip.expense.dto.SettlementRequest;
import com.splittrip.expense.dto.SettlementResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/trips/{tripId}/settlements")
public class SettlementController {

    private final SettlementService service;

    public SettlementController(SettlementService service) { this.service = service; }

    @GetMapping
    public List<SettlementResponse> list(@CurrentUserId UUID userId, @PathVariable UUID tripId) {
        return service.list(tripId, userId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SettlementResponse create(@CurrentUserId UUID userId, @PathVariable UUID tripId,
                                     @Valid @RequestBody SettlementRequest req) {
        return service.create(tripId, userId, req);
    }

    @DeleteMapping("/{settlementId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@CurrentUserId UUID userId, @PathVariable UUID tripId, @PathVariable UUID settlementId) {
        service.delete(tripId, userId, settlementId);
    }
}
