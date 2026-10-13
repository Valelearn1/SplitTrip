package com.splittrip.auth;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

/** Risposte 401/403 in formato Problem Details, scritte a mano: non passano dai controller. */
@Component
public class ProblemAuthHandlers {

    public AuthenticationEntryPoint entryPoint() {
        return (request, response, ex) -> write(response, 401, "Non autenticato", "Token mancante, scaduto o non valido");
    }

    public AccessDeniedHandler deniedHandler() {
        return (request, response, ex) -> write(response, 403, "Accesso negato", "Non hai i permessi per questa operazione");
    }

    private static void write(HttpServletResponse response, int status, String title, String detail) throws IOException {
        response.setStatus(status);
        response.setContentType("application/problem+json");
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.getWriter().write("{\"status\":" + status + ",\"title\":\"" + title + "\",\"detail\":\"" + detail + "\"}");
    }
}
