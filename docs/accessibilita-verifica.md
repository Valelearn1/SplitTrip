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

## Impostazioni di sistema (Task 4)

| Prova | Risultato (2026-10-20, localhost a 430 px) |
|---|---|
| Testo normale | invariato: testo 16 px, titoli 24, icone 22 |
| Browser con carattere al 125% | tutto cresce insieme (20 / 30 / 28 px), il testo va a capo, nessuno scorrimento orizzontale |
| Dynamic Type su iPhone, «Aumenta contrasto» su Mac, colori forzati | regole in `index.css` verificate da `cssSystem.test.ts`; prova dal dispositivo nella lista per il telefono |

## Verifica a mano (Task 8, 2026-10-20, localhost con i dati della demo)

Strumenti: Chrome con la pagina in riquadri da 320 e 430 px, testo al 200% (`font-size` della radice), filtri SVG `feColorMatrix` per i quattro tipi di daltonismo, albero di accessibilità letto dal DOM, tastiera vera per pannelli e ruota.

### Riflusso (WCAG 1.4.10) e testo grande (1.4.4)

| Prova | Pagine | Risultato |
|---|---|---|
| 320 px | 17 (Home, Nuovo viaggio, Entra con codice, Notifiche, Profilo, Panoramica, Spese, Nuova spesa, Saldi, Salda, Liste, Foto, Chat, Impostazioni, Riepilogo scommessa e numeri, Registrazione, Password dimenticata) | nessuno scorrimento orizzontale, nessun elemento fuori dallo schermo; l'intestazione e «Crea l'immagine», che il 19/10 sforavano di 5 px, ora stanno dentro (icone in rem) |
| 430 px con testo al 200% | le stesse 17 + Riepilogo numeri | nessun elemento fuori: il testo va a capo |

### Nomi, ruoli e annunci (4.1.2, 4.1.3)

| Prova | Risultato |
|---|---|
| Controlli senza nome accessibile | 0 su 17 pagine (da 7 a 30 controlli per pagina) |
| `tabindex` positivi (ordine forzato) | nessuno: l'ordine di Tab è quello del documento |
| Titolo `h1` | presente su ogni pagina |
| Regioni live | chat: `role="log"` «Messaggi»; riepilogo: `role="status"` sull'esito della scommessa; barra offline, «Di nuovo online», avviso «Serve la rete», «Aggiorna» e proposte dei luoghi: `role="status"`/`aria-live` (verificati dai test) |

### Daltonismo (1.4.1)

| Schermata | Protanopia / deuteranopia | Tritanopia | Acromatopsia | Esito |
|---|---|---|---|---|
| Saldi | il lampone di «devi dare» diventa oliva, il cobalto resta | il lampone diventa rosso mattone | tutto grigio | ok: ogni importo ha segno, freccia e testo («Devi dare / Deve ricevere»); le barre hanno l'importo accanto |
| Ruota «Chi offre?» | due spicchi su tre con la stessa tinta | spicchi rosa e grigio | tre grigi chiari | ok: i nomi stanno dentro gli spicchi e i separatori bianchi li dividono; chi vince è annunciato per nome |
| Accesso | sfondo stagionale cambia tinta, campi e bottone restano leggibili | idem | idem | ok |

### Tastiera (2.1.1, 2.4.3, 2.4.7, 2.4.11)

| Prova | Risultato |
|---|---|
| Ordine di Tab sulla Panoramica | logo → tema → notifiche → profilo → esci → «Indietro» → chat → impostazioni → tab del viaggio → contenuto: segue il documento |
| Focus visibile | anello cobalto da 3 px (`:focus-visible`) su ogni controllo raggiunto da tastiera |
| Pannello «Chi offre?» (`<dialog>`) | all'apertura il focus entra (prima casella «Vale»); dopo 9 Tab resta dentro; Esc chiude e il focus torna al bottone «Chi offre?» con l'anello visibile. Stesso componente per le conferme di eliminazione e «Lascia il viaggio» |
| Ruota | si usa da tastiera: caselle di chi c'è, «Gira!», «Registra la spesa», «Rigira», «Chiudi» |

### Lettore di schermo (1.1.1, 1.3.1, 4.1.2)

| Prova | Risultato |
|---|---|
| Icone decorative | `aria-hidden` dal componente `Icon` (26 su 26 nella Panoramica, tranne le 3 del meteo che hanno un senso e portano `role="img"` + nome: «nuvoloso», «poco nuvoloso») |
| Nomi dei controlli | nessun bottone o link senza nome su 22 pagine (axe + sonda sul DOM) |
| Pannelli | `aria-labelledby` sul titolo («Chi offre?») |
| Modulo spesa, importi | etichette, errori collegati con `aria-describedby`, importi con segno e testo |

### Chi non sente (1.2, 1.4.2)

| Suono | Segnale visivo equivalente |
|---|---|
| Messaggio nuovo in chat (suono breve, disattivabile) | avviso «Marco: …» con «Apri la chat» (`role="status"`), contatore dei non letti sul bottone Chat e sulla tab, «sta scrivendo…» in chat. L'app non ha altro audio |

### Problemi trovati e correzioni

| Schermata | Prova | Problema | Criterio | Gravità | Correzione | Stato |
|---|---|---|---|---|---|---|
| Intestazione, Riepilogo (storie) | 320 px (19/10) | 5 px fuori dallo schermo | 1.4.10 | bassa | dimensioni delle icone in rem (Task 4) | ⚠️ ricontrollato nel Task 9: non bastava (righe sotto) |
| Intestazione | 320 px (20/10, Task 9) | logo, nome e quattro bottoni chiedono 341 px: 5 px fuori | 1.4.10 | media | sotto i 360 px il nome «SplitTrip» resta solo per il lettore di schermo, si vede il mappamondo | ✅ |
| Riepilogo, «Crea l'immagine per le storie» | 320 px (20/10, Task 9) | il bottone non andava a capo: 4 px fuori | 1.4.10 | bassa | colonne `minmax(0, 1fr)` e testo del bottone a capo | ✅ |
| Notifiche con non lette | 320 px (20/10, Task 9) | «Segna tutte come lette» accanto al titolo: 9 px fuori (nel Task 8 non c'erano non lette) | 1.4.10 | media | `.page-head` va a capo: il bottone scende sotto il titolo | ✅ |
| Riepilogo «I momenti» | 430 px (20/10, segnalato dall'autrice) | miniature da 300 px allargavano la pagina a 562 px | 1.4.10 | alta | griglia `minmax(0, 1fr)` e miniature quadrate | ✅ (commit 8e60514) |
| Chip, persone scelte, interruttori | colori forzati (revisione finale, 20/10) | la scelta si vedeva solo dal fondo e il focus era un box-shadow: coi colori forzati spariscono entrambi | 1.4.1, 2.4.7 | media | `Highlight`/`HighlightText` per la scelta, contorno `Highlight` per il focus, binario e pallino dell'interruttore coi colori di sistema | ✅ |
| Barra «Aggiorna» | testo grande a 320 px (revisione finale) | «Aggiorna» e «Dopo» non andavano a capo | 1.4.10 | bassa | la riga dei bottoni va a capo | ✅ |
| Luogo (destinazione) | lettore di schermo (revisione v3.3) | con errore e servizio giù, `aria-describedby` puntava al messaggio nascosto | 1.3.1 | bassa | descritto dal messaggio visibile | ✅ (v3.4) |
| Chip, interruttore, persone | «Aumenta contrasto» (revisione v3.3) | il focus restava a 3 px | 2.4.7 | bassa | `--focus` a 4 px nel blocco del contrasto | ✅ (v3.4) |
| — | tutte le altre prove | nessun problema | — | — | — | — |

## Lista per il telefono (circa 20 minuti, dall'autrice)

Segna ok oppure il problema (con uno screenshot) accanto a ogni riga.

**iPhone, VoiceOver** (Impostazioni → Accessibilità → VoiceOver; tre tocchi sul tasto laterale per accenderlo e spegnerlo)
1. Apri il sito, entra: ogni campo e bottone viene letto con il suo nome (Email, Password, «Mostra password», Entra).
2. Home: scorri a destra con un dito: viaggio in evidenza, meteo, «quanto ti devono», novità.
3. Apri un viaggio → Spese → «+»: compila importo, descrizione, scegli categoria e chi ha pagato, salva. Gli errori vengono letti.
4. Saldi: ogni riga dice il nome, l'importo e «deve dare» / «deve ricevere».
5. Chat: scrivi e invia; un messaggio nuovo viene annunciato.
6. Panoramica → «Chi offre?»: VoiceOver resta dentro il pannello; «Gira!» e il vincitore vengono letti; «Chiudi» riporta al bottone.

**iPhone, testo grande** (Impostazioni → Accessibilità → Schermo e dimensione testo → Testo più grande, al massimo)
7. Home, Saldi, modulo spesa, Riepilogo: tutto leggibile, niente tagliato, nessuno scorrimento laterale.

**Mac, contrasto aumentato** (Impostazioni di Sistema → Accessibilità → Schermo → «Aumenta contrasto»)
8. Card piene sopra lo sfondo stagionale, bordi visibili, link sottolineati, anello di focus più spesso (Tab tra i bottoni).

**Mac, Chrome → Impostazioni → Aspetto → Dimensione carattere «Molto grande»**
9. Il testo cresce ovunque e nulla esce dallo schermo a 430 px (device toolbar, iPhone 14 Pro Max).

