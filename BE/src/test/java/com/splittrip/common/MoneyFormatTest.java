package com.splittrip.common;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

class MoneyFormatTest {

    @Test
    void euroColSimboloLeAltreColCodice() {
        assertThat(MoneyFormat.format(new BigDecimal("1234.5"), "EUR")).isEqualTo("1.234,50 €");
        assertThat(MoneyFormat.format(new BigDecimal("1234.5"), "USD")).isEqualTo("1.234,50 USD");
    }

    @Test
    void rispettaIDecimaliDellaValuta() {
        assertThat(MoneyFormat.format(new BigDecimal("2000.00"), "JPY")).isEqualTo("2.000 JPY");
        assertThat(MoneyFormat.format(new BigDecimal("22.499"), "EUR")).isEqualTo("22,50 €");
    }
}
