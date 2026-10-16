package com.splittrip.auth.reset;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import java.util.Properties;

/** SMTP se MAIL_HOST è impostata (Brevo: smtp-relay.brevo.com:587, STARTTLS), altrimenti il log: l'avvio non fallisce mai per l'email. */
@Configuration
class MailConfig {

    @Bean
    PasswordResetMailer passwordResetMailer(MailProperties mail) {
        if (mail.host() == null || mail.host().isBlank()) return new LogPasswordResetMailer(mail.logLinks());
        JavaMailSenderImpl sender = new JavaMailSenderImpl();
        sender.setHost(mail.host());
        sender.setPort(mail.port());
        sender.setUsername(mail.username());
        sender.setPassword(mail.password());
        Properties props = sender.getJavaMailProperties();
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.connectiontimeout", "5000");
        props.put("mail.smtp.timeout", "5000");
        props.put("mail.smtp.writetimeout", "5000");
        return new SmtpPasswordResetMailer(sender, mail.from());
    }
}
