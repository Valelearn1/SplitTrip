package com.splittrip.auth.reset;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/** Senza SMTP configurato: in sviluppo (MAIL_LOG_LINKS=true) il link va nel log, altrimenti solo un avviso, mai il link. */
class LogPasswordResetMailer implements PasswordResetMailer {

    private static final Logger log = LoggerFactory.getLogger(LogPasswordResetMailer.class);
    private final boolean logLinks;

    LogPasswordResetMailer(boolean logLinks) { this.logLinks = logLinks; }

    @Override
    public void send(String to, String link) {
        if (logLinks) log.info("Link di ripristino (solo sviluppo): {}", link);
        else log.warn("Email non configurata (BREVO_API_KEY vuota): link di ripristino non spedito");
    }
}
