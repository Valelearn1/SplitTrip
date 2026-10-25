# SplitTrip

App per vacanze tra amici: spese divise, conti chiari (capstone corso fullstack).
Mission e scelte: `docs/superpowers/specs/2026-10-12-splittrip-design.md`, `docs/decisioni.md`.

## Struttura
- `BE/` Spring Boot 4.1 / Java 25, PostgreSQL, Flyway. Package per funzionalità sotto `com.splittrip`: `common`, `auth` (anche `auth/reset`, password dimenticata), `user`, `trip` (viaggi, partecipanti anche senza account, codice invito), `expense`, `todo` (liste), `photo` (foto e scontrini), `notification` (ascolta gli eventi), `weather` (Open-Meteo), `live` (WebSocket STOMP), `chat` (anche reazioni), `ai` (consigli con l'API di Anthropic), `places` (proposte di luoghi), `rates` (cambio del giorno, D-69), `home` (la Home in una chiamata), `wrapped` (riepilogo di fine viaggio, badge, «Indovina il totale»).
- `FE/` React 19 + TypeScript + Vite. Feature folders sotto `src/features/`, condiviso in `src/shared/`.
- `docs/` spec, piani (`docs/superpowers/plans/`), registro decisioni, prompt Stitch, card Trello.

## Comandi
- DB locale: `docker compose up -d db` (porta 5432: il Postgres di Homebrew deve essere fermo, `brew services stop postgresql@18`)
- Backend: `cd BE && sh mvnw spring-boot:run` · test: `sh mvnw test` (serve Docker per Testcontainers)
- Frontend: `cd FE && npm run dev` · test: `npm test` · build: `npm run build`
- Swagger: http://localhost:8080/swagger-ui.html
- E2E: `docker compose up -d db-e2e` poi `cd FE && npm run e2e` (Playwright avvia backend 8081 e frontend 4173)

## Regole
- Soldi: `BigDecimal` scala 2 HALF_UP, mai `double`. Date ISO nell'API, italiane a schermo.
- Schema solo via Flyway; `ddl-auto=validate`. Mai toccare una migrazione già applicata.
- Soft delete solo per spese e rimborsi. Id utente sempre dal token (`@CurrentUserId`).
- I soldi puntano a `participants(id)`, mai a `users` (D-30). Un partecipante non si cancella: chi esce ha `left_at`.
- Ogni service su un viaggio inizia con `TripAccessService.requireMember/requireOrganizer`.
- Errori sempre in Problem Details; mai stack trace al client.
- Immagini solo via `ImageProcessor` (riscrittura JPEG, niente EXIF): mai salvare i byte ricevuti così come sono. Posizione delle foto solo col consenso di chi carica.
- Tempo reale (D-39): si scrive via REST, il WebSocket spinge solo dopo il commit (`AfterCommit` + `LivePublisher`); JWT nel CONNECT, mai nell'URL.
- AI (D-41): al modello mai nomi, email o importi; chiave solo in `ANTHROPIC_API_KEY`.
- Luoghi (D-46, D-51): la ricerca passa solo dal backend (`/api/places`, Open-Meteo), mai dal browser; al servizio va solo il testo cercato.
- Colori (D-57, D-58): sempre dai token di `FE/src/index.css` (con la versione scura), nomi per ruolo (`--accent` cobalto, `--negative` lampone); il lampone vuol dire solo «devi dare» ed errori, mai decorazione. Eccezioni dichiarate in `DESIGN.md` (illustrazioni, logo, pastelli della ruota, immagine per le storie, QR dell'invito D-67). Testo nuovo fuori dalle card: verificarlo sopra lo sfondo stagionale.
- Importi (v3.2, D-70): nel browser `AmountField` rifiuta il tasto che rende l'importo impossibile (`nextAmount`), ripulisce l'incolla senza tagliare le cifre intere e toglie i punti delle migliaia uscendo dal campo; al massimo 999.999,99 con centesimi e 99.999.999 senza (`AmountRules` nel server, `maxCents` nel browser), anche sul convertito; a schermo il punto delle migliaia sempre.
- Valute (D-69, D-70): ogni spesa e rimborso tiene scontrino (`amount`, `currency`), cambio (`fxRate`, 8 decimali, mai ricalcolato) e importo convertito (`amountBase`): i conti leggono solo `amountBase`. Il cambio suggerito arriva da Frankfurter (BCE) solo dal backend (`/api/rates`). Valute senza centesimi (JPY, HUF, ISK, KRW): stesso elenco in `Currencies.java` e `currencies.ts`.
- Destinazione del viaggio (D-60): sempre una proposta scelta dall'elenco, con coordinate; `/api/places` risponde 503 se il servizio è giù.
- Password dimenticata (D-61): token solo come hash SHA-256, monouso, 30 minuti; email con l'API di Brevo dopo il commit; chiave solo in `BREVO_API_KEY`, mai nel repository.
- E2E e CI (D-66): un flusso nuovo che tocca soldi o accesso entra nel giro e2e (`FE/e2e/`); la CI deve essere verde prima del tag. Le pagine dei soldi si rileggono sempre all'apertura (`refetchOnMount: 'always'`): spese e saldi non arrivano dal vivo.
- Offline (D-63, feature `pwa`): sola lettura, mai scritture in coda (mutation `networkMode: 'always'`); in cache del service worker solo guscio, font e immagini (mai JSON di `/api`); persistenza solo per le chiavi in `features/pwa/persistence.ts`; all'uscita `clearDeviceData()`; aumentare `CACHE_VERSION` quando cambia la forma dei dati dell'API; service worker spento in `npm run dev`, prove con `npm run build && npm run preview`.
- Linguaggio (D-64): senza genere per riformulazione; i test neutralLanguage (FE) e NeutralLanguageTest (BE) bloccano le forme vietate.
- Accessibilità (D-65): WCAG 2.2 AA; ogni pagina nuova chiama expectAccessible() nel suo test; dimensioni del testo in rem; registro in docs/accessibilita-verifica.md.
- Copertina (D-71): `trips.cover_photo_id` scelta da chiunque sia nel viaggio (`PUT/DELETE /api/trips/{id}/cover`); Home e riepilogo preferiscono la scelta all'ultima foto.
- Pagine legali (D-72): `/termini` e `/privacy` pubbliche, dati in `features/legal/legal.ts`; un fornitore nuovo o un dato nuovo salvato sul dispositivo va aggiunto all'informativa. Contatto `privacy@splittrip.example` solo di esempio. Registrazione solo con la casella dei termini spuntata (D-73): `acceptedTerms` controllato anche dal server, che salva `users.terms_accepted_at`.
- «Conta per» (D-75): tolto dall'interfaccia; in parti uguali ogni quota pesa 1, mai `defaultWeight`; il backend tiene `WEIGHT` per le spese salvate prima.
- Preferenze (D-48): suono, animazioni, valuta predefinita e tema stanno sull'account (`PATCH /api/me/preferences`), `localStorage` è solo la copia della sessione.
- TDD: test prima del codice. Un commit per task, direttamente su `main`: niente branch di funzionalità né pull request (D-23). Un tag per versione.
- **I commit li fa l'autrice**: segnalare «Puoi committare: `<messaggio>`» e fermarsi. Mai `git commit`/`git push`. Nessuna riga `Co-Authored-By`: l'autrice è l'unica autrice.
- Decisioni nuove → riga in `docs/decisioni.md` (ID progressivo, data, alternative, motivo, reversibilità).

## Rilasci
v1 Core (auth, viaggi, spese, saldi) → v1.5 Divisioni smart (D-28: i soldi puntano ai partecipanti, valuta sulla spesa, divisione per giorni e pesi) → v2 Social (to-do, foto+mappa, notifiche) → v3 Live (chat, notifiche live) → v3.1 Rifinitura (dai test con gli amici) → v3.2 Giochi, riepilogo e tema (ruota, riepilogo di fine viaggio, tema scuro, stagioni) → v3.3 Inclusiva (accessibilità verificata, linguaggio senza genere, impostazioni di sistema) → v3.4 Qualità e demo (CI, giro e2e, QR dell'invito) → v3.5 App installabile e offline (PWA, consultazione senza rete) → v3.6 Valute (spese e rimborsi in altre valute). Tag `v1.0`, `v1.5`, `v2.0`, `v3.0`, `v3.1`, `v3.2`, `v3.3`, `v3.4`, `v3.5`, `v3.6`.

## Stato
- v1 Core completa (2026-10-13, tag `v1.0`, `v1.0.1`). v1.5 Divisioni smart completa (2026-10-14, tag `v1.5`). v2 Social completa (2026-10-14, tag `v2.0`). v3 Live completa (2026-10-15, tag `v3.0`): backend 162 test, frontend 89 test. v3.1 Rifinitura completa (2026-10-15, tag `v3.1`): backend 186 test, frontend 108 test. v3.2 Giochi, riepilogo e tema completa (2026-10-16, tag `v3.2`, con le aggiunte prima del tag: importi, occhiolino, destinazione reale, «Chi offre?» come offerta, password dimenticata): backend 222 test, frontend 250 test. Punto di controllo del 19: urgenti (D-62), poi v3.5 App installabile e offline (2026-10-19, D-63): frontend 284 test. v3.3 Inclusiva completa (2026-10-20, D-64, D-65): backend 229 test, frontend 332 test. v3.4 Qualità e demo completa (2026-10-21, D-66…D-68): backend 230 test, frontend 345 test, 1 giro e2e, CI su GitHub Actions. v3.6 Valute completa (2026-10-21, D-69, D-70): backend 251 test, frontend 367 test, 1 giro e2e con una spesa in yen. Dopo il tag: copertina del viaggio scelta dal gruppo (2026-10-23, D-71): backend 254 test, frontend 370 test. Termini e informativa sulla privacy, con la casella alla registrazione (2026-10-24, D-72, D-73): backend 258 test, frontend 380 test. Ritocchi dal telefono e «Conta per» tolto (2026-10-25, D-74, D-75): frontend 383 test. Prossimo: preparazione della demo. Consegna domenica 25 ottobre entro le 21, presentazione il 28.
- Punto di controllo sullo scope: lunedì 19 ottobre 2026 (D-27, spostato dal 18).
- Grafica: sistema visivo in `DESIGN.md` (token in `FE/src/index.css`), prodotto in `PRODUCT.md`, brief Impeccable in `.impeccable/surfaces/fe-src.md`.
- Visione oltre il capstone: `docs/ROADMAP.md`.
