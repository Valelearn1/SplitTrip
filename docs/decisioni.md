# Registro delle decisioni

Una riga per decisione. **Reversibile** indica se cambiarla più avanti costa poco (sì) o richiede un rifacimento (no).

| ID | Data | Decisione | Alternative scartate | Motivo | Reversibile |
|---|---|---|---|---|---|
| D-01 | 2026-10-12 | Rilasci incrementali: v1 Core, v2 Social, v3 Live; v3 si taglia per primo se in ritardo | tutto in un'unica release | 2 settimane, una persona; ogni versione è presentabile da sola | — |
| D-02 | 2026-10-12 | Auth JWT con registrazione, anche se non obbligatoria | nessun account | serve un'identità per "chi ha pagato per chi" e per dimostrare la sicurezza | no |
| D-03 | 2026-10-12 | Divisione spese: equa + importi personalizzati | solo equa; percentuali e quote "a parti" | copre i casi reali senza far esplodere UI e test | sì (estendibile) |
| D-04 | 2026-10-12 | Una valuta per viaggio, nessuna conversione; rimborsi registrabili come movimenti | multi-valuta | semplicità; i rimborsi chiudono il cerchio dei conti | sì |
| D-05 | 2026-10-12 | Ingresso nel viaggio con codice/link invito | invito via email | niente servizio email, niente email esposte, è come si fa tra amici | sì |
| D-06 | 2026-10-12 | Due ruoli: ORGANIZER e MEMBER | ruoli granulari | sufficiente per dimostrare l'autorizzazione | sì |
| D-07 | 2026-10-12 | Foto salvate nel DB (bytea), ridimensionate server-side | Cloudinary, S3, Supabase, disco Render | il filesystem free di Render è effimero; Cloudinary mai usato dall'autrice; zero servizi esterni e credenziali. Da rivalutare se il DB free (1 GB) non basta | sì (migrabile a storage esterno) |
| D-08 | 2026-10-12 | Hosting Render free: backend Docker, frontend statico, Postgres. In produzione dal 2026-10-13: API https://splittrip-api.onrender.com (Swagger su `/swagger-ui.html`), sito https://splittrip.onrender.com. Nota: il DB free di Render scade dopo 30 giorni (metà novembre 2026) | altri hosting; Neon per il DB (valutato il 2026-10-13, scartato per ora: si è liberato lo slot free cancellando il DB di un progetto precedente) | già usato al corso; `render.yaml` nel repo | sì |
| D-09 | 2026-10-12 | Flyway per le migrazioni | `ddl-auto=update`, Liquibase | schema versionato e deterministico, già conosciuto | no |
| D-10 | 2026-10-12 | Mappa con Leaflet + OpenStreetMap | Google Maps | gratis, senza chiave API | sì |
| D-11 | 2026-10-12 | UI mobile-first | desktop-first | in vacanza si usa dal telefono | — |
| D-12 | 2026-10-12 | Monolite a strati, package-by-feature, eventi interni per le notifiche | architettura esagonale; saldi materializzati con eventi | semplice, testabile, coerente con il corso; eventi disaccoppiano notifiche e WebSocket senza doppia fonte di verità | sì |
| D-13 | 2026-10-12 | Saldi calcolati al volo da una classe pura, nessuna tabella saldi | tabella saldi aggiornata a eventi | una sola fonte di verità; test unitari puri | sì |
| D-14 | 2026-10-12 | Semplificazione trasferimenti con algoritmo greedy (≤ n−1) | minimo assoluto | il minimo assoluto è NP-difficile; greedy è deterministico e sufficiente | sì |
| D-15 | 2026-10-12 | Soft delete solo per spese e rimborsi (`@SoftDelete`); hard delete per to-do e foto | hard ovunque; soft ovunque | i dati finanziari meritano cestino e storico; foto e to-do sono usa-e-getta | sì |
| D-16 | 2026-10-12 | Date ISO 8601 nell'API e nel DB; formato italiano a schermo | `DD-MM-YYYY` nell'API | non ambiguo, ordinabile, default di Spring/Postgres/JS/Swagger | sì |
| D-17 | 2026-10-12 | CSRF di Spring disabilitato: API stateless con JWT nell'header `Authorization`, CORS limitato al frontend | cookie di sessione + token CSRF | un sito terzo non può aggiungere l'header; la protezione CSRF serve ai cookie, che non usiamo | — |
| D-18 | 2026-10-12 | Token JWT 24 h senza refresh token | access + refresh | complessità che non ripaga in 2 settimane | sì |
| D-19 | 2026-10-12 | Frontend: React Router, TanStack Query, React Hook Form + Zod, CSS Modules; niente Redux | Redux, axios, Tailwind | nessuno stato globale che giustifichi Redux; librerie leggere e mirate | sì |
| D-20 | 2026-10-12 | Spec-driven: spec → piano → Trello → TDD; commit fatti dall'autrice; registro decisioni | sviluppo diretto | progettazione visibile e documentata, utile anche in presentazione | — |
| D-23 | 2026-10-12 | Git: commit diretti su `main`, uno per task, più un tag per versione (`v1.0`, `v2.0`, `v3.0`). Niente branch di funzionalità né pull request | branch + PR per card (come nel progetto di gruppo) | progetto di una sola persona in 2 settimane: senza revisore la PR è una formalità, e l'overhead (branch, push, apertura, merge) non ripaga. La qualità resta garantita da TDD e dalla revisione del codice prima di chiudere ogni versione | sì (si possono introdurre branch e PR in qualsiasi momento) |
