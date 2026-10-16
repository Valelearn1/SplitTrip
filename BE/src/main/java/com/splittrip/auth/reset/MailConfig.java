package com.splittrip.auth.reset;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.web.client.RestClient;

import java.net.http.HttpClient;
import java.time.Duration;

/** API di Brevo se BREVO_API_KEY è impostata, altrimenti il log: l'avvio non fallisce mai per l'email. */
@Configuration
class MailConfig {

    @Bean
    PasswordResetMailer passwordResetMailer(MailProperties mail) {
        if (mail.apiKey() == null || mail.apiKey().isBlank()) return new LogPasswordResetMailer(mail.logLinks());
        // timeout di 5 s: un servizio lento non deve tenere appesa la richiesta di chi ha dimenticato la password
        var factory = new JdkClientHttpRequestFactory(HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build());
        factory.setReadTimeout(Duration.ofSeconds(5));
        return new BrevoApiPasswordResetMailer(RestClient.builder().requestFactory(factory), mail.apiKey(), mail.from());
    }

    /** Le email partono fuori dalla richiesta: un Brevo lento non tiene occupati thread HTTP e connessioni al database. */
    @Bean
    ThreadPoolTaskExecutor mailExecutor() {
        var executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(1);
        executor.setMaxPoolSize(2);
        executor.setQueueCapacity(50);
        executor.setThreadNamePrefix("mail-");
        return executor;
    }
}
