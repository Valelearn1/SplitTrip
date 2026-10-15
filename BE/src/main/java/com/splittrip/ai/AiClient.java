package com.splittrip.ai;

/** Modello linguistico dietro un'interfaccia, come OpenMeteoClient: nei test si sostituisce con un finto. */
public interface AiClient {
    boolean available();
    /** Testo della risposta; AiUnavailableException se il servizio non risponde o manca la chiave. */
    String complete(String system, String user);
}
