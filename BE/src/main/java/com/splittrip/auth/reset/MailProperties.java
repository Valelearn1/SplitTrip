package com.splittrip.auth.reset;

import org.springframework.boot.context.properties.ConfigurationProperties;

/** Chiave dell'API di Brevo e mittente verificato, solo dalle variabili d'ambiente; chiave vuota = niente invio. */
@ConfigurationProperties("app.mail")
public record MailProperties(String apiKey, String from, boolean logLinks) {}
