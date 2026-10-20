package com.splittrip.common;

import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;

/** D-64: messaggi, badge, email e descrizioni dell'API senza forme che si accordano col genere. Commenti esclusi. */
class NeutralLanguageTest {

    static final Map<String, Pattern> FORBIDDEN = Map.ofEntries(
            Map.entry("l'organizzatore / organizzatore", Pattern.compile("(?i)\\borganizzatore\\b")),
            Map.entry("gli altri", Pattern.compile("(?i)\\bgli altri\\b")),
            Map.entry("amici", Pattern.compile("(?i)\\bamici\\b")),
            Map.entry("tutti", Pattern.compile("(?i)\\btutti\\b")),
            Map.entry("Bentornata/o", Pattern.compile("\\bBentornat[oa]\\b")),
            Map.entry("Benvenuta/o + luogo", Pattern.compile("\\bBenvenut[oa]\\s+(su|in|a)\\b")),
            Map.entry("sicuro/a?", Pattern.compile("(?i)\\bsicur[oa]\\?")),
            Map.entry("sei stato/a", Pattern.compile("(?i)\\bsei stat[oa]\\b")),
            Map.entry("sono nuovo/a", Pattern.compile("(?i)\\bsono nuov[oa]\\b")),
            Map.entry("te stesso/a", Pattern.compile("(?i)\\bte stess[oa]\\b")),
            Map.entry("primo a / il primo (persona)", Pattern.compile("(?i)\\bprimo a \\w+re\\b")));

    static String stripComments(String src) {
        return src.replaceAll("(?s)/\\*.*?\\*/", "").replaceAll("(?m)(^|[^:])//.*$", "$1");
    }

    @Test
    void nessunTestoDelServerSiAccordaColGenere() throws IOException {
        List<String> found = new ArrayList<>();
        try (Stream<Path> paths = Files.walk(Path.of("src/main/java"))) {
            for (Path p : paths.filter(f -> f.toString().endsWith(".java")).toList()) {
                String[] lines = stripComments(Files.readString(p)).split("\n");
                for (int i = 0; i < lines.length; i++) {
                    for (var e : FORBIDDEN.entrySet()) {
                        if (e.getValue().matcher(lines[i]).find()) found.add(p + ":" + (i + 1) + " «" + e.getKey() + "»: " + lines[i].strip());
                    }
                }
            }
        }
        assertThat(found).isEmpty();
    }

    @Test
    void commentiEUrlNonContano() {
        assertThat(stripComments("// l'organizzatore\nString a = \"ok\"; /* tutti */")).doesNotContain("organizzatore", "tutti");
        assertThat(stripComments("String u = \"https://tutti.example\";")).contains("tutti");
    }
}
