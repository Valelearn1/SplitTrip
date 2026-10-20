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

    static final Map<String, Pattern> FORBIDDEN = Map.of(
            "l'organizzatore / organizzatore", Pattern.compile("(?i)\\borganizzatore\\b"),
            "gli altri", Pattern.compile("(?i)\\bgli altri\\b"),
            "amici", Pattern.compile("(?i)\\bamici\\b"),
            "tutti", Pattern.compile("(?i)\\btutti\\b"),
            "Bentornata/o", Pattern.compile("\\bBentornat[oa]\\b"),
            "sei stato/a", Pattern.compile("(?i)\\bsei stat[oa]\\b"),
            "primo a / il primo (persona)", Pattern.compile("(?i)\\bprimo a \\w+re\\b"));

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
