package com.splittrip.ai;

/** Senza ANTHROPIC_API_KEY i consigli non compaiono (available: false nell'API). */
public class DisabledAiClient implements AiClient {
    @Override public boolean available() { return false; }
    @Override public String complete(String system, String user) { throw new AiUnavailableException("Chiave API assente"); }
}
