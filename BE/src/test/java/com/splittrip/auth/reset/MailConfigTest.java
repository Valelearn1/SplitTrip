package com.splittrip.auth.reset;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.system.CapturedOutput;
import org.springframework.boot.test.system.OutputCaptureExtension;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(OutputCaptureExtension.class)
class MailConfigTest {

    @Test
    void chiaveSenzaMittenteLoDiceAllAvvio(CapturedOutput out) {
        new MailConfig().passwordResetMailer(new MailProperties("chiave", "", false));
        assertThat(out.getOut()).contains("MAIL_FROM");
    }
}
