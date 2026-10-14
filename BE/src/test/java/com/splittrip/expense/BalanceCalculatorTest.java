package com.splittrip.expense;

import com.splittrip.expense.BalanceCalculator.ExpenseInput;
import com.splittrip.expense.BalanceCalculator.MemberBalance;
import com.splittrip.expense.BalanceCalculator.Result;
import com.splittrip.expense.BalanceCalculator.SettlementInput;
import com.splittrip.expense.BalanceCalculator.ShareInput;
import com.splittrip.expense.BalanceCalculator.Transfer;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.IntStream;

import static org.assertj.core.api.Assertions.assertThat;

class BalanceCalculatorTest {

    UUID marco = UUID.fromString("00000000-0000-0000-0000-000000000001");
    UUID giulia = UUID.fromString("00000000-0000-0000-0000-000000000002");
    UUID vale = UUID.fromString("00000000-0000-0000-0000-000000000003");
    BalanceCalculator calc = new BalanceCalculator();

    static BigDecimal eur(String s) { return new BigDecimal(s); }

    ExpenseInput cena90() {
        return new ExpenseInput(marco, eur("90.00"), List.of(
                new ShareInput(marco, eur("30.00")), new ShareInput(giulia, eur("30.00")), new ShareInput(vale, eur("30.00"))));
    }

    ExpenseInput taxi30() {
        return new ExpenseInput(giulia, eur("30.00"), List.of(
                new ShareInput(giulia, eur("15.00")), new ShareInput(vale, eur("15.00"))));
    }

    @Test
    void esempioDiRiferimentoDellaSpec() {
        Result r = calc.compute(List.of(marco, giulia, vale), List.of(cena90(), taxi30()),
                List.of(new SettlementInput(vale, marco, eur("10.00"))));

        assertThat(r.balances()).containsExactly(
                new MemberBalance(marco, eur("90.00"), eur("30.00"), eur("50.00")),
                new MemberBalance(giulia, eur("30.00"), eur("45.00"), eur("-15.00")),
                new MemberBalance(vale, eur("0.00"), eur("45.00"), eur("-35.00")));
        assertThat(r.suggestedTransfers()).containsExactly(
                new Transfer(vale, marco, eur("35.00")),
                new Transfer(giulia, marco, eur("15.00")));
    }

    @Test
    void laSommaDeiNettiEZero() {
        Result r = calc.compute(List.of(marco, giulia, vale), List.of(cena90(), taxi30()), List.of());
        BigDecimal sum = r.balances().stream().map(MemberBalance::net).reduce(BigDecimal.ZERO, BigDecimal::add);
        assertThat(sum).isEqualByComparingTo("0");
    }

    @Test
    void viaggioSenzaMovimenti() {
        Result r = calc.compute(List.of(marco, giulia), List.of(), List.of());
        assertThat(r.balances()).allSatisfy(b -> assertThat(b.net()).isEqualByComparingTo("0"));
        assertThat(r.suggestedTransfers()).isEmpty();
    }

    @Test
    void rimborsoTotaleAzzeraIlSaldo() {
        Result r = calc.compute(List.of(marco, vale),
                List.of(new ExpenseInput(marco, eur("40.00"), List.of(new ShareInput(marco, eur("20.00")), new ShareInput(vale, eur("20.00"))))),
                List.of(new SettlementInput(vale, marco, eur("20.00"))));
        assertThat(r.suggestedTransfers()).isEmpty();
        assertThat(r.balances()).extracting(MemberBalance::net).allSatisfy(n -> assertThat(n).isEqualByComparingTo("0"));
    }

    @Test
    void unMembroSenzaMovimentiCompareConZero() {
        Result r = calc.compute(List.of(marco, giulia, vale),
                List.of(new ExpenseInput(marco, eur("10.00"), List.of(new ShareInput(giulia, eur("10.00"))))), List.of());
        assertThat(r.balances()).extracting(MemberBalance::participantId).containsExactly(marco, giulia, vale);
        assertThat(r.balances().get(2).net()).isEqualByComparingTo("0");
    }

    @Test
    void alMassimoNMenoUnoTrasferimentiEDeterministico() {
        List<UUID> ids = IntStream.range(0, 7)
                .mapToObj(i -> UUID.fromString("00000000-0000-0000-0000-00000000001" + i)).toList();
        List<ExpenseInput> expenses = new ArrayList<>();
        for (int i = 0; i < ids.size(); i++) {
            BigDecimal amount = eur((i + 1) * 10 + ".00");
            expenses.add(new ExpenseInput(ids.get(i), amount, EqualSplitter.split(amount, ids)));
        }
        Result first = calc.compute(ids, expenses, List.of());
        Result second = calc.compute(ids, expenses, List.of());
        assertThat(first.suggestedTransfers()).hasSizeLessThanOrEqualTo(ids.size() - 1);
        assertThat(first).isEqualTo(second);
        BigDecimal moved = first.suggestedTransfers().stream().map(Transfer::amount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal owedTotal = first.balances().stream().map(MemberBalance::net).filter(n -> n.signum() < 0)
                .map(BigDecimal::negate).reduce(BigDecimal.ZERO, BigDecimal::add);
        assertThat(moved).isEqualByComparingTo(owedTotal);
    }
}
