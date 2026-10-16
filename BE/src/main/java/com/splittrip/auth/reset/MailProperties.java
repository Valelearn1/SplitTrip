package com.splittrip.auth.reset;

import org.springframework.boot.context.properties.ConfigurationProperties;

/** Credenziali SMTP solo dalle variabili d'ambiente (MAIL_*); host vuoto = niente SMTP. */
@ConfigurationProperties("app.mail")
public record MailProperties(String host, int port, String username, String password, String from, boolean logLinks) {}
