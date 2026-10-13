package com.splittrip.expense;

import com.splittrip.auth.CurrentUserId;
import com.splittrip.expense.dto.BalancesResponse;
import com.splittrip.expense.dto.SummaryResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/trips/{tripId}")
public class BalanceController {

    private final BalanceService service;

    public BalanceController(BalanceService service) { this.service = service; }

    @GetMapping("/balances")
    public BalancesResponse balances(@CurrentUserId UUID userId, @PathVariable UUID tripId) {
        return service.balances(tripId, userId);
    }

    @GetMapping("/summary")
    public SummaryResponse summary(@CurrentUserId UUID userId, @PathVariable UUID tripId) {
        return service.summary(tripId, userId);
    }
}
