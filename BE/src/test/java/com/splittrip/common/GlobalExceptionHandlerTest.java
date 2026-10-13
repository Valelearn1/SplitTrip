package com.splittrip.common;

import org.junit.jupiter.api.Test;
import org.springframework.http.ProblemDetail;

import static org.assertj.core.api.Assertions.assertThat;

class GlobalExceptionHandlerTest {

    GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void appExceptionDiventaProblemDetail() {
        ProblemDetail pd = handler.handleApp(new NotFoundException("Viaggio non trovato"));
        assertThat(pd.getStatus()).isEqualTo(404);
        assertThat(pd.getTitle()).isEqualTo("Risorsa non trovata");
        assertThat(pd.getDetail()).isEqualTo("Viaggio non trovato");
    }

    @Test
    void eccezioneGenericaNonEsponeIlMessaggio() {
        ProblemDetail pd = handler.handleUnexpected(new IllegalStateException("segreto interno"));
        assertThat(pd.getStatus()).isEqualTo(500);
        assertThat(pd.getDetail()).doesNotContain("segreto");
    }
}
