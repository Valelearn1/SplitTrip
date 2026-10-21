package com.splittrip.common;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/** D-70: valute senza centesimi, tetti per valuta; D-69: conversione a 2 decimali HALF_UP. */
class AmountRulesTest {

    @Test
    void valuteSenzaCentesimiCondivise() {
        assertThat(Currencies.NO_CENTS).containsExactlyInAnyOrder("JPY", "HUF", "ISK", "KRW");
        assertThat(Currencies.fractionDigits("JPY")).isZero();
        assertThat(Currencies.fractionDigits("HUF")).isZero();      // il browser lo mostra senza decimali: ci allineiamo
        assertThat(Currencies.fractionDigits("EUR")).isEqualTo(2);
    }

    @Test
    void conCentesimiFinoA999999e99SenzaFinoA99999999() {
        assertThatCode(() -> AmountRules.check("amount", new BigDecimal("999999.99"), "EUR")).doesNotThrowAnyException();
        assertThatThrownBy(() -> AmountRules.check("amount", new BigDecimal("1000000.00"), "EUR"))
                .isInstanceOf(FieldException.class).hasMessage("Al massimo 999.999,99 (due decimali)");
        assertThatCode(() -> AmountRules.check("amount", new BigDecimal("99999999"), "JPY")).doesNotThrowAnyException();
        assertThatThrownBy(() -> AmountRules.check("amount", new BigDecimal("100000000"), "JPY"))
                .isInstanceOf(FieldException.class).hasMessage("Al massimo 99.999.999 (senza decimali)");
        assertThatThrownBy(() -> AmountRules.check("amount", new BigDecimal("2000.50"), "JPY"))
                .isInstanceOf(FieldException.class).hasMessage("Lo yen giapponese non ha centesimi");
        assertThatThrownBy(() -> AmountRules.check("shares[0].amount", new BigDecimal("10.005"), "EUR"))
                .isInstanceOf(FieldException.class).hasMessage("Al massimo 999.999,99 (due decimali)");
    }

    @Test
    void conversioneADueDecimaliHalfUp() {
        assertThat(AmountRules.convert(new BigDecimal("2000"), new BigDecimal("0.00562366"))).isEqualByComparingTo("11.25");   // 11.24732
        assertThat(AmountRules.convert(new BigDecimal("5000"), new BigDecimal("0.00562366"))).isEqualByComparingTo("28.12");   // 28.1183
        assertThat(AmountRules.convert(new BigDecimal("12.34"), BigDecimal.ONE)).isEqualByComparingTo("12.34");
    }
}
