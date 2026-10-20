package com.splittrip.wrapped;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class CategoryPercentagesTest {

    @Test
    void sommanoSempre100ColRestoMaggiore() {
        var amounts = List.of(new BigDecimal("10"), new BigDecimal("10"), new BigDecimal("10"));
        assertThat(WrappedService.percentages(amounts, new BigDecimal("30"))).containsExactly(34, 33, 33);
        var mixed = List.of(new BigDecimal("50.50"), new BigDecimal("25.25"), new BigDecimal("24.25"));
        assertThat(WrappedService.percentages(mixed, new BigDecimal("100"))).containsExactly(51, 25, 24);
    }

    @Test
    void totaleZeroTuttoAZero() {
        assertThat(WrappedService.percentages(List.of(BigDecimal.ZERO), BigDecimal.ZERO)).containsExactly(0);
    }
}
