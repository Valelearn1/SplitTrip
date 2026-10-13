# SplitTrip

App per vacanze tra amici: spese divise, conti chiari (capstone corso fullstack).
Mission e scelte: `docs/superpowers/specs/2026-10-12-splittrip-design.md`, `docs/decisioni.md`.

## Struttura
- `BE/` Spring Boot 4.1 / Java 25, PostgreSQL, Flyway. Package per funzionalità sotto `com.splittrip`: `common`, `auth`, `user`, `trip`, `expense`.
- `FE/` React 19 + TypeScript + Vite. Feature folders sotto `src/features/`, condiviso in `src/shared/`.
- `docs/` spec, piani (`docs/superpowers/plans/`), registro decisioni, prompt Stitch, card Trello.

## Comandi
- DB locale: `docker compose up -d db` (porta 5432: il Postgres di Homebrew deve essere fermo, `brew services stop postgresql@18`)
- Backend: `cd BE && sh mvnw spring-boot:run` · test: `sh mvnw test` (serve Docker per Testcontainers)
- Frontend: `cd FE && npm run dev` · test: `npm test` · build: `npm run build`
- Swagger: http://localhost:8080/swagger-ui.html

## Regole
- Soldi: `BigDecimal` scala 2 HALF_UP, mai `double`. Date ISO nell'API, italiane a schermo.
- Schema solo via Flyway; `ddl-auto=validate`. Mai toccare una migrazione già applicata.
- Soft delete solo per spese e rimborsi. Id utente sempre dal token (`@CurrentUserId`).
- Ogni service su un viaggio inizia con `TripAccessService.requireMember/requireOrganizer`.
- Errori sempre in Problem Details; mai stack trace al client.
- TDD: test prima del codice. Un commit per task, direttamente su `main`: niente branch di funzionalità né pull request (D-23). Un tag per versione.
- **I commit li fa l'autrice**: segnalare «Puoi committare: `<messaggio>`» e fermarsi. Mai `git commit`/`git push`. Nessuna riga `Co-Authored-By`: l'autrice è l'unica autrice.
- Decisioni nuove → riga in `docs/decisioni.md` (ID progressivo, data, alternative, motivo, reversibilità).

## Rilasci
v1 Core (auth, viaggi, spese, saldi) → v1.5 Divisioni smart (D-28: i soldi puntano ai partecipanti, valuta sulla spesa, divisione per giorni e pesi) → v2 Social (to-do, foto+mappa, notifiche) → v3 Live (chat, notifiche live). Tag `v1.0`, `v1.5`, `v2.0`, `v3.0`.

## Stato
- v1 Core completa (2026-10-13): backend 70 test, frontend 20 test, deploy su Render. Prossimo: spec e piano della v1.5.
- Punto di controllo sullo scope: sabato 18 ottobre 2026 (D-27).
- Grafica: sistema visivo in `DESIGN.md` (token in `FE/src/index.css`), prodotto in `PRODUCT.md`, brief Impeccable in `.impeccable/surfaces/fe-src.md`.
- Visione oltre il capstone: `docs/ROADMAP.md`.
