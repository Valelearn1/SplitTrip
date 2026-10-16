package com.splittrip.auth.reset;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

/** Email di ripristino via SMTP (Brevo): testo semplice in italiano, formula neutra. */
class SmtpPasswordResetMailer implements PasswordResetMailer {

    private final JavaMailSender sender;
    private final String from;

    SmtpPasswordResetMailer(JavaMailSender sender, String from) {
        this.sender = sender;
        this.from = from;
    }

    @Override
    public void send(String to, String link) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("SplitTrip <" + from + ">");
        message.setTo(to);
        message.setSubject("Reimposta la password di SplitTrip");
        message.setText("""
                Ciao,

                hai chiesto di reimpostare la password di SplitTrip. Apri questo link entro 30 minuti:

                %s

                Se non l'hai chiesto tu, ignora questa email: la password resta quella di prima.

                SplitTrip · Dividete le spese, non gli amici.
                """.formatted(link));
        sender.send(message);
    }
}
