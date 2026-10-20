# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Gruppi di amici (3–8 persone) in vacanza insieme. Usano SplitTrip dal telefono, spesso di fretta (al ristorante, in taxi, in spiaggia): vogliono registrare una spesa in pochi secondi e sapere in ogni momento chi deve cosa a chi. Un membro del gruppo è l'organizzatore (crea il viaggio, invita, chiude i conti); gli altri sono partecipanti. Uso desktop secondario, per pianificare prima e sistemare i conti dopo.

## Product Purpose

Accompagnare i gruppi di amici in ogni fase della vacanza: pianificare insieme prima di partire, tenere traccia di spese e cose da fare durante, e ritrovarsi con ricordi condivisi e conti chiari al ritorno. Successo: nessuna discussione sui soldi a fine viaggio; i saldi sono chiari, verificabili e si chiudono con un tap («Salda»).

## Positioning

Il viaggio è l'unità di tutto (spese, membri, liste, foto): non un gruppo generico di spese. I saldi sono calcolati da un motore trasparente (netto = pagato − dovuto ± rimborsi) e semplificati in pochi trasferimenti; ogni importo mostra segno e testo, mai solo il colore. Ingresso con codice invito condiviso su WhatsApp, senza email né ricerca utenti.

## Operating Context

Progetto finale (capstone) di un corso fullstack, consegnato con presentazione; repository pubblico con README e link alla demo. Backend Spring Boot su Render (piano free: il server si addormenta e la prima richiesta può richiedere 30–60 s), frontend React statico, PostgreSQL. Rilasci incrementali: v1 Core (auth, viaggi, spese, saldi), v2 Social (to-do, foto con mappa, notifiche), v3 Live (chat, notifiche in tempo reale).

## Capabilities and Constraints

- v1: registrazione/login JWT; viaggi con stato (In pianificazione → In corso → Chiuso) e codice invito; spese con divisione equa o importi personalizzati; rimborsi; saldi con trasferimenti suggeriti; cestino spese (organizzatore).
- Una valuta per viaggio (default EUR). Date ISO nell'API, formato italiano a schermo. Importi con due decimali.
- Terminologia: viaggio, partecipante, organizzatore, spesa, quota, rimborso, saldo, «Salda», «devi dare / devi ricevere», codice invito.
- Viaggio chiuso = sola lettura. Niente foto profilo in v1 (iniziali), niente valute multiple, niente notifiche push.
- Stack frontend già deciso: React 19 + TypeScript, React Router, TanStack Query, React Hook Form + Zod, CSS Modules/variabili CSS (nessun framework CSS).

## Brand Commitments

Nome «SplitTrip» (provvisorio ma in uso). Lingua dell'interfaccia: italiano. Tono: caldo, amichevole, affidabile, un compagno di viaggio, non una banca. Riferimento visivo vincolante: le schermate Stitch in `docs/stitch/` (font DM Sans, icone Material Symbols, sfondo `#f8f9ff`, superfici `#eff4ff`→`#dbe3f1`, testo `#141c26`; tab bar in basso su mobile). La palette di Stitch (teal e corallo) è stata sostituita in v3.2 da cobalto `#2347b8` e lampone `#a3305e`, con lo sfondo illustrato della stagione del viaggio (D-58).

## Evidence on Hand

Schermate di riferimento: `docs/stitch/*/screen.png` e `code.html` (7 schermate: dashboard mobile/desktop, nuova spesa mobile/desktop, spese, saldi e pareggio, i miei viaggi). Esempio dati reale usato nei test: cena 90 € di Marco divisa in tre, taxi 30 € di Giulia, rimborso 10 € di Vale → Marco +50, Giulia −15, Vale −35. Nessuna testimonianza, metrica o cliente da citare: non inventarne.

## Product Principles

1. Inserire una spesa deve costare meno di dieci secondi: importo prima di tutto, pagante preselezionato, tutti inclusi.
2. Ogni numero sui soldi è leggibile da chiunque: segno, testo e colore insieme, cifre tabulari.
3. Il viaggio è il contenitore: tutto quello che vedi appartiene al viaggio aperto.
4. Chiarezza prima di espressione: è uno strumento che si usa in piedi, con una mano.
5. La demo resta onesta: niente funzioni finte, niente dati inventati sull'app.

## Accessibility & Inclusion

Decisione D-24: mai solo il colore (segno + etichetta accanto agli importi, testo nei badge, icona + testo negli errori); contrasto WCAG AA (cobalto `#2347b8` e lampone `#a3305e` per il testo, scuro `#9db4ff` e `#ff9cc4`; il lampone vivo solo per barre e riempimenti; il testo sulle card in vetro sopra l'illustrazione è verificato dal contrast test); tastiera e lettori di schermo (focus visibile, `aria-label` sulle icone, `role="alert"`, `<dialog>`); target touch ≥ 44 px e font ≥ 16 px nei campi; `prefers-reduced-motion` rispettato; notifiche sempre visive.

## Voce senza genere (D-64)

La regola: **si cambia la frase**, non si usano asterischi, schwa o doppie forme («organizzatore/organizzatrice»). Il problema è l'accordo, non il pronome: «nessuno deve restituire niente» e «ognuno imposta…» vanno bene perché nulla si accorda con chi legge.

| Trovato | Riformulazione |
|---|---|
| «Bentornata su SplitTrip» | «Ciao di nuovo» |
| «l'organizzatore», «organizzatore» | «chi organizza (il viaggio)»; etichetta del ruolo «organizza» |
| «tutti», «Tutti inclusi» | «tutto il gruppo», «tutte le persone del viaggio» |
| «gli altri» | «il resto del gruppo» |
| «amici», «Vacanze tra amici» | «gruppo», «compagnia»; slogan **«Dividete le spese, non le amicizie»** |
| participi accordati («sei stato aggiunto», «sicuro?») | «Ora fai parte di …», «Vuoi davvero …?» |
| badge «Il banchiere», «Compagno di viaggio»… | soprannomi neutri: Cassa del gruppo, Occhio da reporter, Voce del gruppo, Buona forchetta, Conti in ordine, Cuore del gruppo, Giramondo, Compagnia di viaggio |

Vale per i testi a schermo, i messaggi del server, l'email di ripristino e le istruzioni al modello AI. I nomi nel codice (`ORGANIZER`, `isOrganizer`) non cambiano. Il test `FE/src/test/neutralLanguage.test.ts` e `NeutralLanguageTest` nel backend bloccano le forme vietate; un'eccezione (es. «tutti i giorni», riferito ai giorni) si motiva nella lista `ALLOWED` del test.
