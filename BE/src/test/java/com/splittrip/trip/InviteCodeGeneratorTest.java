package com.splittrip.trip;

import org.junit.jupiter.api.Test;

import java.util.HashSet;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class InviteCodeGeneratorTest {

    InviteCodeGenerator gen = new InviteCodeGenerator();

    @Test
    void formatoXXXXTrattinoXXXXSenzaCaratteriAmbigui() {
        for (int i = 0; i < 200; i++) {
            assertThat(gen.generate()).matches("^[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$");
        }
    }

    @Test
    void codiciDiversi() {
        Set<String> codes = new HashSet<>();
        for (int i = 0; i < 500; i++) codes.add(gen.generate());
        assertThat(codes).hasSize(500);
    }

    @Test
    void normalizzaMinuscoleESpazi() {
        assertThat(InviteCodeGenerator.normalize(" roma-7k2p ")).isEqualTo("ROMA-7K2P");
    }
}
