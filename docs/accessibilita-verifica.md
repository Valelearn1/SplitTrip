# Verifica di accessibilità — v3.3 (D-65)

Obiettivo: WCAG 2.2 livello AA. Due parti: controlli automatici dentro i test (restano per sempre) e verifica a mano, schermata per schermata.

## Controlli automatici

- Strumento: `axe-core` 4.14, helper `FE/src/test/a11y.ts` (`expectAccessible()`), regole WCAG 2.0/2.1/2.2 A e AA. Il contrasto non è controllato da axe (jsdom non impagina): lo verifica `FE/src/shared/utils/contrast.test.ts` su ogni coppia di colori dei due temi.
- Dove: nel primo test che disegna ciascuna delle 22 pagine (`*Page.tsx`), con i dati finti di MSW; test nuovi per Registrazione, Foto e Cestino.
- Il controllo funziona: `FE/src/test/a11y.test.tsx` dimostra che un bottone senza nome e un campo senza etichetta fanno fallire il test.

| Data | Pagine | Violazioni trovate | Note |
|---|---|---|---|
| 2026-10-20 | 22 su 22 | 0 | le regole di D-24 (etichette, nomi dei bottoni, ruoli, `aria-*`) erano già applicate |

| Pagina | Regola axe | Elemento | Correzione |
|---|---|---|---|
| — | — | — | nessuna violazione al primo controllo |

## Verifica a mano

(compilata nel Task 8 del piano, dopo le correzioni)
