package com.splittrip.ai;

import com.splittrip.ai.dto.AiTip;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

/** Validazione della risposta del modello (D-41): solo JSON, solo campi attesi, limiti di lunghezza. Mai eseguita, solo mostrata. */
public final class AiJson {

    private static final JsonMapper JSON = JsonMapper.builder().build();
    private static final Set<String> CATEGORIES = Set.of("SEE", "EAT", "PACK", "TIP");

    private AiJson() {}

    public static List<AiTip> parseTips(String raw) {
        JsonNode arr = read(raw).path("tips");
        if (!arr.isArray()) throw new AiUnavailableException("Campo tips assente");
        List<AiTip> out = new ArrayList<>();
        for (int i = 0; i < arr.size() && out.size() < 5; i++) {
            JsonNode t = arr.get(i);
            String title = text(t, "title", 60), body = text(t, "text", 280), category = text(t, "category", 10);
            if (title != null && body != null && category != null && CATEGORIES.contains(category)) out.add(new AiTip(title, body, category));
        }
        if (out.size() < 3) throw new AiUnavailableException("Meno di 3 consigli validi");
        return out;
    }

    public static List<String> parsePacking(String raw, Collection<String> existing) {
        JsonNode arr = read(raw).path("items");
        if (!arr.isArray()) throw new AiUnavailableException("Campo items assente");
        Set<String> seen = new HashSet<>();
        existing.forEach(e -> seen.add(key(e)));
        List<String> out = new ArrayList<>();
        for (int i = 0; i < arr.size() && out.size() < 12; i++) {
            String text = text(arr.get(i), "text", 80);
            if (text != null && seen.add(key(text))) out.add(text);
        }
        if (out.isEmpty()) throw new AiUnavailableException("Nessuna voce valida");
        return out;
    }

    static String writeTips(List<AiTip> tips) {
        return JSON.writeValueAsString(java.util.Map.of("tips", tips));
    }

    /** Il modello a volte racchiude il JSON in testo o in un blocco di codice: si prende dalla prima { all'ultima }. */
    private static JsonNode read(String raw) {
        if (raw == null) throw new AiUnavailableException("Risposta vuota");
        int start = raw.indexOf('{'), end = raw.lastIndexOf('}');
        if (start < 0 || end <= start) throw new AiUnavailableException("Risposta senza JSON");
        try {
            return JSON.readTree(raw.substring(start, end + 1));
        } catch (JacksonException e) {
            throw new AiUnavailableException("JSON non valido");
        }
    }

    private static String text(JsonNode node, String field, int max) {
        JsonNode v = node.path(field);
        if (!v.isString()) return null;
        String s = v.asString().strip();
        return s.isEmpty() || s.length() > max ? null : s;
    }

    private static String key(String s) { return s.strip().replaceAll("\\s+", " ").toLowerCase(Locale.ITALIAN); }
}
