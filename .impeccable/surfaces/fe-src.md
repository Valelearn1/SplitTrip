---
version: 1
slug: "fe-src"
primary_target: "FE/src"
related_targets: []
---

# Surface: app SplitTrip v1 (tutte le pagine sotto FE/src)

Scope: l'intera app web mobile-first (login, viaggi, dashboard viaggio, spese, saldi, impostazioni). Visitor mode: **Operate**.

Audience e job: amici in vacanza, da telefono, di fretta; inserire una spesa in pochi secondi e sapere chi deve cosa a chi. L'organizzatore gestisce viaggio e membri.

Contenuto reale: dati dell'utente (viaggi, spese, saldi) dall'API; copy italiano esistente. Vincoli: logica, rotte e test invariati; libertà sul layout; accessibilità D-24; riferimento visivo vincolante docs/stitch. Anti-obiettivi: non deve sembrare una banca/fintech né risultare minimal e anonimo.

## Direction contract

THESIS: SplitTrip è il taccuino di viaggio del gruppo, non un estratto conto. Il saldo personale («+50,00 € · devi ricevere») è la prima cosa che si legge su ogni schermata del viaggio; rifiuta la lista grigia di transazioni con un accento solo.

OWN-WORLD: fondo azzurro-latte #f8f9ff con superfici a strati (#eff4ff → #dbe3f1) e card bianche a raggio 16; teal #00685c come colore di azione e di «devi ricevere», corallo #aa361e/#ff7355 solo per «devi dare»; DM Sans ovunque, cifre tabulari sui soldi, importi grandi (32–40 px) con pillola di stato accanto; Material Symbols come icone; bottoni pieni teal alti 48; tab bar bianca in basso con icona + etichetta.

STORY: apro l'app → vedo i miei viaggi come card con destinazione e date → entro nel viaggio e capisco subito se devo dare o ricevere → aggiungo una spesa dal «+» con l'importo gigante → nei saldi vedo le barre e premo «Salda».

FIRST VIEWPORT (dashboard viaggio, 390 px): header bianco con logo, selettore viaggio e iniziali; intestazione con nome viaggio, destinazione · date, badge stato colorato; card «Il tuo saldo» a tutta larghezza con importo 40 px e pillola «↑ devi ricevere / ↓ devi dare», sotto «Spesa totale gruppo» e «La tua quota» su fondo tinto; due bottoni «+ Nuova spesa» (teal pieno) e «Regola conti» (teal chiaro); sotto, fila di partecipanti come cerchi con iniziali, riga «Codice invito ABCD-1234 · Copia»; «Ultime spese» con icona categoria in cerchio tinto, titolo, «pagato da», importo; tab bar fissa in basso Panoramica · Spese · Saldi · Liste (presto) · Foto (presto); bottone «+ Nuova spesa» primario nella card del saldo (sulla dashboard non c'è FAB: il FAB vive nelle liste Viaggi e Spese).

Signature move: i **cerchi delle iniziali** dei partecipanti (teal chiaro, bordo teal per «tu») che ricorrono ovunque — pagante nel form, saldi, membri — e la **pillola di saldo** (freccia + testo) incollata a ogni importo con segno. Motion: transizioni di 150 ms su hover/focus, nessuna animazione di ingresso; tutto disattivato con prefers-reduced-motion.

FORM: direzione pinnata dall'autrice: la richiesta originale e PRODUCT.md › Brand Commitments rendono vincolanti le schermate docs/stitch; per questo concept-seed non è stato eseguito (un roll sovrascriverebbe un riferimento vincolante). Build code-led (nessuna generazione immagini disponibile). Seed key: n/a, pin registrato qui.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
