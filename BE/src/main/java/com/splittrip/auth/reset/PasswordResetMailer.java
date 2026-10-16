package com.splittrip.auth.reset;

/** Chi spedisce il link di ripristino: SMTP (Brevo) in produzione, il log in sviluppo; nei test si sostituisce. */
public interface PasswordResetMailer {
    void send(String to, String link);
}
