# SplitTrip — perché, con cosa, come

Quattro risposte brevi per la presentazione: perché un'altra app, le chicche, lo stack usato, i passi seguiti per ogni funzionalità.

## 1. Perché un'app, se esistono Splitwise e Tricount?

«Tricount divide i conti, SplitTrip si occupa del viaggio.»

| Cosa fanno le app esistenti | Cosa fa in più SplitTrip |
|---|---|
| Dividono le spese in parti uguali o per importi | Divide anche **per presenza**: chi arriva al terzo giorno non paga le prime due notti |
| Tutti devono avere l'app | Chi non la scarica **è nel viaggio lo stesso**, aggiunto per nome, e i conti lo contano |
| Solo i soldi | **Prima**: liste condivise e consigli AI. **Durante**: foto sulla mappa, meteo, chat del gruppo. **Dopo**: «Il vostro viaggio in numeri» |
| Una valuta | Lo scontrino si scrive **nella sua valuta**; il cambio BCE del giorno resta salvato con la spesa |
| Serve la rete | **Offline in sola lettura**: in metropolitana i conti si vedono |
| Ognuno inserisce chi vuole | **Accessibile** (WCAG 2.2 AA verificata), testi senza genere, tema scuro, installabile come app |

E un motivo personale: era il progetto giusto per provare un metodo completo, dalla specifica al deploy, su un problema che conosco.

## 2. Le chicche

Le cose che non ti aspetti da un'app di conti, e che a ogni demo fanno dire «ah».

| Chicca | Cos'è | Perché conta |
|---|---|---|
| **Chi partecipa a ogni spesa** | In ogni spesa scegli chi c'era: in parti uguali tra le persone spuntate, con importi scritti a mano, o **per presenza** (notti o giorni di ciascuno, con arrivi e partenze diverse). L'anteprima delle quote si aggiorna mentre scrivi, e il centesimo di resto va sempre alla stessa persona nel browser e nel server | la cena a cui Luca non c'era non la paga Luca; chi arriva al terzo giorno non paga le prime due notti |
| **Valute** | Scrivi lo scontrino nella sua valuta (400 sterline); il cambio BCE del giorno arriva precompilato, o lo scrivi tu, e i conti restano in euro al centesimo. Il cambio è **salvato con la spesa**, mai ricalcolato; yen e simili senza centesimi | «2.000 JPY ≈ 11,25 €» senza calcolatrice, e i saldi di ieri non cambiano se oggi il cambio si muove |
| **Giochi** | «**Chi offre?**»: una ruota nei colori della stagione sceglie chi paga il giro e apre la spesa già compilata. A fine viaggio «**Il vostro viaggio in numeri**»: prima «**Indovina il totale**» (un'ipotesi a testa dal proprio telefono), poi i numeri veri, i record, i momenti sulla mappa, **un badge a testa**, classifiche divertenti mai sui soldi, e un'**immagine per le storie** disegnata nel browser | il viaggio finisce con un gioco e un'immagine da condividere, non con la calcolatrice |
| **Accessibilità** | WCAG 2.2 AA verificata: controlli axe in ogni pagina (0 violazioni), prova a mano con tastiera, lettore di schermo, zoom e filtri per il daltonismo; testo grande, contrasto aumentato e colori forzati del telefono rispettati; ogni importo ha segno e testo, mai solo il colore | chiunque nel gruppo usa l'app, e il lampone «devi dare» si capisce anche senza vederlo |
| **Linguaggio senza genere** | Nessun testo dà per scontato chi legge: «chi organizza», «Ciao di nuovo», «Dividete le spese, non le amicizie». Niente schwa né asterischi, che i lettori di schermo non leggono; un test blocca le forme col genere prima del commit | un gruppo di vacanza è misto e ognuno si ritrova nei testi |

Altre, più piccole: chi non ha l'app è nel viaggio lo stesso e può rivendicare il suo posto entrando col codice; il QR dell'invito disegnato nel telefono; lo sfondo che cambia con la stagione della destinazione; la chat con reazioni, «sta scrivendo» e le spese che compaiono come righe-evento; l'app installabile che si apre anche senza rete.

## 3. Stack

| Livello | Scelta |
|---|---|
| Backend | Java 25, Spring Boot 4.1, Spring Security (JWT), JPA, Flyway, WebSocket STOMP |
| Database | PostgreSQL (Docker in locale, Render in produzione), `NUMERIC` per i soldi |
| Frontend | React 19, TypeScript, Vite, TanStack Query, React Hook Form + Zod, CSS con variabili, Leaflet, Motion, PWA (service worker, IndexedDB) |
| Servizi esterni | Open-Meteo (meteo e luoghi), Frankfurter (cambi BCE), Brevo (email di ripristino), Anthropic Claude Haiku (consigli), OpenStreetMap (mappa) |
| Test | JUnit 5, MockMvc, Testcontainers · Vitest, Testing Library, MSW, axe · Playwright |
| Qualità | ESLint, `tsc`, GitHub Actions (CI a ogni push) |
| Hosting | Render: sito statico, backend in Docker, Postgres; configurazione in `render.yaml` |
| Strumenti | Claude Code con le skill Superpowers, Trello, Stitch per le prime bozze grafiche |

Numeri al 27 ottobre: 259 test backend, 387 frontend, 1 giro end-to-end, 76 decisioni registrate, 11 versioni rilasciate (v1.0 → v3.6).

## 4. I passi per ogni versione

Ogni versione (v1 Core, v1.5 Divisioni, v2 Social, v3 Live, … v3.6 Valute) ha seguito lo stesso giro.

| Passo | Cosa succede | Dove si vede |
|---|---|---|
| 1. **Brainstorming** | Domande una alla volta finché il problema è chiaro: cosa serve, per chi, cosa resta fuori. Due o tre approcci con pro e contro, scelta motivata | — |
| 2. **Specifica** | Documento di design scritto e approvato prima del codice: modello dati, API, schermate, casi limite, test previsti | `docs/superpowers/specs/` (11 spec) |
| 3. **Piano** (plan mode) | La spec diventa compiti piccoli, ognuno con i file da toccare, il test da scrivere per primo e il criterio di «fatto» | `docs/superpowers/plans/` (11 piani) |
| 4. **Card su Trello** | Ogni compito del piano diventa una card con descrizione, riferimenti, dipendenze e checklist dei passi. Liste per versione, poi «In corso» e «Fatto». Regola: una card va in «Fatto» solo con test verdi e commit fatto | board Trello, `docs/trello-da-incollare.md` |
| 5. **TDD** | Per ogni compito: prima il test, visto fallire; poi il codice minimo che lo fa passare; poi la suite intera | ogni commit |
| 6. **Decisione registrata** | Se il compito comporta una scelta, va nel registro: data, alternative scartate, motivo, reversibilità | `docs/decisioni.md` (D-01 … D-76) |
| 7. **Commit** | Uno per compito, fatto da me, direttamente su `main`: senza revisori una pull request sarebbe una formalità (D-23) | `git log` |
| 8. **Revisione di fine versione** | Rilettura del codice della versione da un contesto «fresco», con la spec davanti; i problemi trovati diventano compiti o voci della roadmap | spec e piani, sezione finale |
| 9. **Tag e documenti** | Tag `vX.Y`, aggiornamento di README, CLAUDE.md e del registro; dalla v3.4 anche la CI deve essere verde prima del tag | tag git, `README.md` |

### Test end-to-end e CI (dalla v3.4)

- **Un giro completo in un browser vero** con Playwright: due persone si registrano, una entra col codice invito, dividono una cena, saldano, aggiungono una spesa in yen. Playwright avvia da solo backend, frontend compilato e un Postgres usa e getta.
- **CI su GitHub Actions** a ogni push: tre job, backend (Testcontainers), frontend (lint, test, build) ed e2e dopo i primi due; semaforo verde o rosso sul commit.
- Alla prima esecuzione il giro ha trovato due errori sui soldi che usando l'app non avevo notato: ora il modulo spesa rilegge sempre le persone e le pagine dei soldi si rileggono all'apertura (D-66).

### Dopo la consegna

I test con gli amici e dal telefono hanno prodotto altre versioni (v3.1 Rifinitura, i ritocchi di D-74 e D-75) con lo stesso giro, in piccolo: domanda, decisione, test, codice, commit.
