package com.splittrip.ai;

import com.splittrip.ai.dto.AiTip;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class AiJsonTest {

    @Test
    void consigliAncheDentroTestoOBlocchiDiCodiceScartandoQuelliFuoriRegola() {
        String raw = """
                Ecco i consigli:
                ```json
                {"tips":[
                  {"title":"Tram 28","text":"Prendilo presto la mattina.","category":"SEE"},
                  {"title":"Pastéis","text":"A Belém, caldi.","category":"EAT"},
                  {"title":"Ombrello","text":"Pioggia prevista.","category":"PACK"},
                  {"title":"Categoria inventata","text":"x","category":"HACK"},
                  {"title":"%s","text":"titolo troppo lungo","category":"TIP"}
                ]}
                ```
                """.formatted("x".repeat(61));
        List<AiTip> tips = AiJson.parseTips(raw);
        assertThat(tips).extracting(AiTip::title).containsExactly("Tram 28", "Pastéis", "Ombrello");
    }

    @Test
    void alMassimoCinqueConsigliEMenoDiTreValidiEUnErrore() {
        String six = "{\"tips\":[" + "{\"title\":\"t\",\"text\":\"x\",\"category\":\"TIP\"},".repeat(5) + "{\"title\":\"t\",\"text\":\"x\",\"category\":\"TIP\"}]}";
        assertThat(AiJson.parseTips(six)).hasSize(5);
        assertThatThrownBy(() -> AiJson.parseTips("{\"tips\":[{\"title\":\"t\",\"text\":\"x\",\"category\":\"TIP\"}]}")).isInstanceOf(AiUnavailableException.class);
        assertThatThrownBy(() -> AiJson.parseTips("non è json")).isInstanceOf(AiUnavailableException.class);
        assertThatThrownBy(() -> AiJson.parseTips("{\"tips\":\"stringa\"}")).isInstanceOf(AiUnavailableException.class);
    }

    @Test
    void vociDellaValigiaSenzaDoppioniNeTroppoLunghe() {
        String raw = "{\"items\":[{\"text\":\" phon \"},{\"text\":\"Ombrello\"},{\"text\":\"ombrello\"},{\"text\":\"%s\"},{\"text\":\"Adattatore\"}]}"
                .formatted("x".repeat(81));
        assertThat(AiJson.parsePacking(raw, List.of("Phon", "Costume"))).containsExactly("Ombrello", "Adattatore");
        assertThatThrownBy(() -> AiJson.parsePacking("{\"items\":[{\"text\":\"Phon\"}]}", List.of("phon"))).isInstanceOf(AiUnavailableException.class);
        String many = "{\"items\":[" + String.join(",", java.util.stream.IntStream.range(0, 15).mapToObj(i -> "{\"text\":\"voce " + i + "\"}").toList()) + "]}";
        assertThat(AiJson.parsePacking(many, List.of())).hasSize(12);
    }
}
