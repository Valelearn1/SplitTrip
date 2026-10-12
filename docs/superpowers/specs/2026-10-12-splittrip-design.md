# SplitTrip — Design v1/v2/v3

**Data:** 12 ottobre 2026 · **Stato:** approvato (brainstorming) · **Scadenza progetto:** 26 ottobre 2026

> *Accompagnare i gruppi di amici in ogni fase della vacanza: pianificare insieme prima di partire, tenere traccia di spese e cose da fare durante, e ritrovarsi con ricordi condivisi e conti chiari al ritorno.*

Il nome "SplitTrip" è provvisorio.

---

## 1. Contesto e obiettivi

Progetto finale (capstone) di un corso fullstack. Deve rappresentare l'autrice e dimostrare quanto appreso: frontend React + TypeScript, backend Java (Spring Boot), sicurezza applicativa, deploy pubblico, repository documentato.

### Requisiti del corso

| Requisito | Obbligatorio | Come lo copriamo |
|---|---|---|
| FE React + TypeScript | sì | React 19, Vite, TS |
| BE Java | sì | Spring Boot 4.1, Java 25, PostgreSQL |
| Sicurezza: SQL injection, XSS, CSRF, dati personali | sì | sezione 7 |
| Repo con descrizione parlante + link alla versione pubblicata | sì | README, deploy su Render |
| Istruzioni chiare per clonare e lanciare | sì | README + `docker-compose.yml` |
| Registrazione account | no | la facciamo comunque (JWT), serve per l'identità nelle spese |
| Suite di test | extra | sezione 9 |
| API docs (Swagger/OpenAPI) | extra | springdoc-openapi |
| README ricco con emoji | extra | sezione 10 |
| Geolocalizzazione / mappa | desiderato | foto con posizione + mappa (v2) |
| Notifiche | desiderato | in-app (v2), live (v3) |
| WebSocket / chat | desiderato | v3 |

### Vincoli

- **2 settimane** di lavoro, una sola persona, presentazione finale.
- Tutto su piani gratuiti.
- Metodo **spec-driven**: spec → piano → task su Trello → TDD. Registro decisioni in `docs/decisioni.md`.

### Successo

Un'app pubblicata, usabile da telefono, con cui un gruppo di amici crea un viaggio, registra spese e sa in ogni momento chi deve cosa a chi; v2 e v3 aggiungono liste, foto, notifiche e chat senza rompere v1.

---

## 2. Rilasci incrementali

Ogni versione è un progetto completo e presentabile da solo. Ogni versione = un tag Git, una migrazione Flyway, una sezione del README.

| Versione | Nome | Contenuto | Giorni |
|---|---|---|---|
| **v1** | Core | auth JWT, viaggi e membri con codice invito, spese (equa + personalizzata), rimborsi, saldi, cestino spese, Swagger, test, deploy, README | 1–7 |
| **v2** | Social | to-do list (valigia / generali), foto con posizione e mappa, notifiche in-app | 8–10 |
| **v3** | Live | chat di gruppo WebSocket, notifiche in tempo reale | 11–12 |
| — | Rifinitura | README finale, prova presentazione | 13–14 |

**Regola di taglio:** se a fine giorno 7 v1 non è chiusa, v3 esce dal piano. Meglio v1 e v2 impeccabili.

---

## 3. Architettura

**Approccio:** monolite a strati, organizzato per funzionalità (package-by-feature), con eventi di dominio interni per disaccoppiare i moduli.

### Backend

```
com.splittrip
  auth/          controller, service, JwtService, SecurityConfig
  user/
  trip/          Trip, TripMember, TripAccessService, invite codes
  expense/       Expense, ExpenseShare, Settlement, BalanceCalculator, BalanceService
  todo/          (v2)
  photo/         (v2)
  notification/  (v2, ascolta gli eventi)
  chat/          (v3)
  common/        Problem Details handler, eventi, utilità
```

Ogni package: `controller → service → repository`, DTO di request/response separati dalle entity.

### Eventi interni

I service pubblicano con `ApplicationEventPublisher`: `ExpenseCreated`, `SettlementCreated`, `MemberJoined`. In v2 il modulo `notification` li ascolta e scrive su `notifications`; in v3 lo stesso listener li inoltra sul WebSocket. I moduli non si conoscono tra loro.

### Saldi

Nessuna tabella saldi. Calcolati al volo da spese + quote + rimborsi da una classe pura (`BalanceCalculator`). I movimenti sono l'unica fonte di verità.

### Frontend

Feature folders che rispecchiano i package del backend (sezione 8).

### Hosting

Render (backend Docker, frontend statico, PostgreSQL), piano free. Le foto sono salvate nel database (sezione 4 e decisione D-07).

---

## 4. Modello dati

Convenzioni:

- `id` UUID; `created_at` ovunque, `updated_at` dove serve.
- Importi `NUMERIC(12,2)` nel DB, `BigDecimal` in Java. Mai `double`.
- Date `date`, timestamp `timestamptz` in UTC.
- Migrazioni **Flyway**: `V1__core.sql`, `V2__social.sql`, `V3__live.sql`.
- Soft delete (`deleted_at`, Hibernate `@SoftDelete`) **solo** su `expenses` e `settlements`. Hard delete altrove.

### v1 — Core

**`users`**

| Colonna | Tipo | Note |
|---|---|---|
| `email` | text | unica, lowercase |
| `password_hash` | text | BCrypt |
| `display_name` | text | 2–40 caratteri |

**`trips`**

| Colonna | Tipo | Note |
|---|---|---|
| `name` | text | |
| `destination` | text | |
| `start_date`, `end_date` | date | `end_date ≥ start_date` |
| `currency` | char(3) | default `EUR`, una per viaggio, nessuna conversione |
| `invite_code` | text | unico, 8 caratteri alfanumerici, `SecureRandom`, rigenerabile |
| `status` | enum | `PLANNING` → `ONGOING` → `CLOSED`; cambiato dall'organizzatore |
| `owner_id` | → users | |

**`trip_members`** — unico su (`trip_id`, `user_id`)

| Colonna | Tipo | Note |
|---|---|---|
| `trip_id` | → trips | |
| `user_id` | → users | |
| `role` | enum | `ORGANIZER` \| `MEMBER` |
| `joined_at` | timestamptz | |

**`expenses`** — soft delete

| Colonna | Tipo | Note |
|---|---|---|
| `trip_id` | → trips | |
| `payer_id` | → users | chi ha pagato, deve essere membro |
| `description` | text | 1–120 caratteri |
| `amount` | numeric | > 0 |
| `date` | date | |
| `category` | enum | `FOOD`, `TRANSPORT`, `LODGING`, `ACTIVITY`, `OTHER` |
| `split_type` | enum | `EQUAL` \| `CUSTOM` (usato solo dalla UI per riaprire il form) |
| `created_by` | → users | |
| `deleted_at` | timestamptz | null se attiva |

**`expense_shares`** — una riga per persona coinvolta

| Colonna | Tipo | Note |
|---|---|---|
| `expense_id` | → expenses | |
| `user_id` | → users | membro del viaggio |
| `amount` | numeric | ≥ 0 |

**Invariante:** `Σ expense_shares.amount = expenses.amount`. Verificata dal service prima di ogni salvataggio. Anche la divisione `EQUAL` viene salvata come quote esplicite, calcolate dal server (sezione 5).

**`settlements`** — rimborsi, soft delete

| Colonna | Tipo | Note |
|---|---|---|
| `trip_id` | → trips | |
| `from_user_id` | → users | chi restituisce |
| `to_user_id` | → users | chi riceve, ≠ from |
| `amount` | numeric | > 0 |
| `date` | date | |
| `note` | text | opzionale |
| `created_by` | → users | |
| `deleted_at` | timestamptz | |

### v2 — Social

**`todo_lists`**

| Colonna | Tipo | Note |
|---|---|---|
| `trip_id` | → trips | |
| `title` | text | |
| `type` | enum | `PACKING` \| `GENERAL` |

**`todo_items`**

| Colonna | Tipo | Note |
|---|---|---|
| `list_id` | → todo_lists | |
| `text` | text | |
| `done` | boolean | |
| `assignee_id` | → users | opzionale |
| `created_by` | → users | |

**`photos`** — immagini nel DB

| Colonna | Tipo | Note |
|---|---|---|
| `trip_id` | → trips | |
| `uploader_id` | → users | |
| `content_type` | text | `image/jpeg` (output dopo il ridimensionamento) |
| `image` | bytea | ridimensionata, lato lungo max 1600 px, EXIF rimossi |
| `thumbnail` | bytea | lato lungo 300 px |
| `caption` | text | opzionale, max 200 |
| `taken_at` | timestamptz | da EXIF se presente |
| `latitude`, `longitude` | numeric | opzionali; salvati solo con consenso esplicito all'upload |

**`notifications`**

| Colonna | Tipo | Note |
|---|---|---|
| `user_id` | → users | destinatario |
| `trip_id` | → trips | |
| `type` | enum | `EXPENSE_ADDED`, `SETTLEMENT_ADDED`, `MEMBER_JOINED` |
| `message` | text | |
| `read` | boolean | |

### v3 — Live

**`messages`**

| Colonna | Tipo | Note |
|---|---|---|
| `trip_id` | → trips | |
| `sender_id` | → users | |
| `content` | text | 1–1000 caratteri |
| `sent_at` | timestamptz | |

### Regole trasversali

- Viaggio `CLOSED` = sola lettura: nessuna scrittura su spese, rimborsi, to-do, foto. Saldi consultabili. Risposta `409 Conflict`.
- L'organizzatore non può lasciare il viaggio né essere rimosso. Un membro con spese o quote non può essere rimosso.
- `DELETE /trips/{id}` solo se `PLANNING` e senza spese.
- Nessuna cancellazione account in v1 (possibile extra: anonimizzazione).

---

## 5. Motore dei saldi

`BalanceCalculator`: classe Java pura, senza Spring né DB. Input: liste di spese (con quote) e rimborsi attivi di un viaggio. Output: saldo netto per membro e trasferimenti suggeriti.

### Fase 1 — Saldo netto

Per ogni membro: `netto = pagato − dovuto + rimborsi dati − rimborsi ricevuti`.

Positivo = deve ricevere, negativo = deve dare. **Invariante:** `Σ netti = 0`.

### Fase 2 — Semplificazione (greedy)

1. Creditori ordinati per importo decrescente, poi per id; debitori idem.
2. Abbina il debitore maggiore al creditore maggiore; registra un trasferimento per `min(debito, credito)`; scala entrambi; avanza chi arriva a zero.
3. Termina quando tutti sono a zero. Al massimo `n − 1` trasferimenti. Deterministico.

Il minimo assoluto è NP-difficile: scelta consapevole, citata in presentazione.

### Centesimi

| Caso | Regola |
|---|---|
| `EQUAL` con resto (100 € / 3) | quote `33,34 · 33,33 · 33,33`; i centesimi avanzati ai primi membri ordinati per `user_id` |
| `CUSTOM` | il client manda le quote; il server rifiuta con `400` se la somma ≠ totale |
| Confronti | `BigDecimal.compareTo`, scala 2, `RoundingMode.HALF_UP` |

### Componenti

| Componente | Responsabilità |
|---|---|
| `BalanceCalculator` | calcolo netti + semplificazione |
| `BalanceService` | carica i dati dal DB, chiama il calcolatore, costruisce i DTO |
| `GET /trips/{id}/balances` | espone netti e trasferimenti suggeriti |
| UI "Salda" | crea un `settlement` precompilato dal trasferimento suggerito |

### Esempio di riferimento (usato nei test)

Marco paga cena 90 € divisa in tre; Giulia paga taxi 30 € per sé e Vale; Vale rimborsa 10 € a Marco.

| Membro | Pagato | Dovuto | Rimborsi dati | Rimborsi ricevuti | Netto |
|---|---|---|---|---|---|
| Marco | 90 | 30 | 0 | 10 | +50 |
| Giulia | 30 | 45 | 0 | 0 | −15 |
| Vale | 0 | 45 | 10 | 0 | −35 |

Trasferimenti: Giulia → Marco 15 €; Vale → Marco 35 €.

---

## 6. API REST

### Convenzioni

| Aspetto | Scelta |
|---|---|
| Prefisso | `/api` (versioni tramite tag Git, non nell'URL) |
| Formato | JSON; date ISO `YYYY-MM-DD`, timestamp ISO 8601 UTC; il frontend mostra in formato italiano |
| Auth | `Authorization: Bearer <jwt>` su tutto tranne `/api/auth/**` |
| Errori | Problem Details (RFC 9457): `{ status, title, detail, errors[] }`; mai stack trace |
| Validazione | Bean Validation sui DTO |
| Autorizzazione | `TripAccessService.requireMember / requireOrganizer` all'inizio di ogni service method; l'id utente viene **sempre** dal token |
| Docs | springdoc-openapi, Swagger UI su `/swagger-ui.html` |

### v1 — Auth

| Metodo | Path | Chi | Note |
|---|---|---|---|
| POST | `/auth/register` | pubblico | `{ email, password, displayName }` → `{ token, user }` |
| POST | `/auth/login` | pubblico | `{ email, password }` → `{ token, user }` |
| GET | `/me` | loggato | profilo |

### v1 — Viaggi e membri

| Metodo | Path | Chi | Note |
|---|---|---|---|
| GET | `/trips` | loggato | viaggi di cui sono membro |
| POST | `/trips` | loggato | crea; creatore = `ORGANIZER`; genera `inviteCode` |
| GET | `/trips/{id}` | membro | dettaglio + membri + `inviteCode` |
| PATCH | `/trips/{id}` | organizzatore | nome, destinazione, date, `status` |
| DELETE | `/trips/{id}` | organizzatore | solo `PLANNING` senza spese |
| GET | `/trips/join-preview?code=` | loggato | nome, destinazione, date, n. membri |
| POST | `/trips/join` | loggato | `{ code }` → membro; idempotente se già membro |
| POST | `/trips/{id}/invite-code/regenerate` | organizzatore | |
| DELETE | `/trips/{id}/members/{userId}` | organizzatore o sé stesso | vincoli in sezione 4 |

### v1 — Spese, rimborsi, saldi

| Metodo | Path | Chi | Note |
|---|---|---|---|
| GET | `/trips/{id}/expenses` | membro | data desc; `?category=` |
| POST | `/trips/{id}/expenses` | membro | `{ description, amount, date, category, payerId, splitType, shares: [{ userId, amount? }] }` |
| GET | `/trips/{id}/expenses/{eid}` | membro | con quote |
| PUT | `/trips/{id}/expenses/{eid}` | autore o organizzatore | sostituisce anche le quote |
| DELETE | `/trips/{id}/expenses/{eid}` | autore o organizzatore | soft delete |
| GET | `/trips/{id}/expenses/trash` | organizzatore | cancellate |
| POST | `/trips/{id}/expenses/{eid}/restore` | organizzatore | |
| GET | `/trips/{id}/settlements` | membro | |
| POST | `/trips/{id}/settlements` | membro | `{ fromUserId, toUserId, amount, date, note? }` |
| DELETE | `/trips/{id}/settlements/{sid}` | autore o organizzatore | soft delete |
| GET | `/trips/{id}/balances` | membro | `{ balances: [{ userId, paid, owed, net }], suggestedTransfers: [{ fromUserId, toUserId, amount }] }` |
| GET | `/trips/{id}/summary` | membro | totale, per categoria, per persona |

Scritture su viaggio `CLOSED` → `409`.

### v2 — Social

| Metodo | Path | Chi | Note |
|---|---|---|---|
| GET / POST | `/trips/{id}/todo-lists` | membro | |
| PATCH / DELETE | `/trips/{id}/todo-lists/{lid}` | membro | |
| POST | `/trips/{id}/todo-lists/{lid}/items` | membro | |
| PATCH / DELETE | `/trips/{id}/todo-lists/{lid}/items/{iid}` | membro | `done`, `text`, `assigneeId` |
| GET | `/trips/{id}/photos` | membro | metadati, paginata; `?withLocation=true` |
| POST | `/trips/{id}/photos` | membro | `multipart/form-data`: `file`, `caption?`, `latitude?`, `longitude?`, `shareLocation` |
| GET | `/trips/{id}/photos/{pid}/image` | membro | byte dell'immagine, `Cache-Control: private, max-age=31536000` |
| GET | `/trips/{id}/photos/{pid}/thumbnail` | membro | byte della thumbnail |
| DELETE | `/trips/{id}/photos/{pid}` | autore o organizzatore | hard delete |
| GET | `/notifications` | loggato | `?unread=true` |
| PATCH | `/notifications/{nid}/read` | destinatario | |
| POST | `/notifications/read-all` | loggato | |

Le immagini richiedono il Bearer come ogni altro endpoint: il frontend le scarica via `fetch` (con TanStack Query, che ne fa cache) e le mostra con `URL.createObjectURL`, tramite un componente `AuthImage`. Nessuna immagine è pubblica e nessun token finisce in una query string.

### v3 — Live

| Canale | Path | Note |
|---|---|---|
| WebSocket STOMP | `/ws` | handshake autenticato con JWT |
| Subscribe | `/topic/trips/{id}/messages` | solo membri |
| Subscribe | `/user/queue/notifications` | notifiche personali |
| Send | `/app/trips/{id}/messages` | `{ content }` |
| GET | `/trips/{id}/messages?before=&size=` | storico paginato |

---

## 7. Sicurezza

### Autenticazione

| Aspetto | Scelta |
|---|---|
| Libreria | Spring Security + jjwt |
| Password | BCrypt costo 12; regole: min 8 caratteri, almeno una lettera e una cifra |
| Token | HS256, durata 24 h, claim solo `sub` (userId) ed `exp`; nessun refresh token in v1 |
| Segreto | env `JWT_SECRET` ≥ 32 byte, generato da Render |
| Client | token in memoria + `localStorage` per sopravvivere al refresh |
| Login fallito | messaggio generico; rate limit 10/min per IP su `/auth/**` (Bucket4j) |

### Autorizzazione

- `SecurityFilterChain`: `/api/auth/**`, Swagger, `/actuator/health` pubblici; resto autenticato.
- `TripAccessService` → `403` se non membro / non organizzatore.
- Modifica e cancellazione risorse: autore o organizzatore.

### Minacce richieste dal corso

| Minaccia | Difesa | Dimostrazione |
|---|---|---|
| SQL injection | JPA con query parametrizzate; nessuna concatenazione; `@Query` con parametri nominati | test con `'; DROP TABLE` in una descrizione |
| XSS | escape automatico di React; vietato `dangerouslySetInnerHTML`; header CSP e `X-Content-Type-Options` via Spring Security; lunghezze massime lato server | test con `<script>` salvato e reso come testo |
| CSRF | API stateless con JWT nell'header: un sito terzo non può aggiungerlo. Protezione CSRF di Spring disabilitata **con motivazione documentata** (D-17). CORS limitato a `CORS_ORIGIN` | `decisioni.md`, presentazione |
| Dati personali | minimizzazione (email, nome); hash password; token senza dati personali; posizione foto solo con consenso per upload; EXIF rimossi al ridimensionamento; segreti in env; HTTPS da Render; nessun dato sensibile nei log; immagini servite solo ai membri | sezione Privacy del README |

### Upload foto

Limite 10 MB; tipi `image/jpeg|png|webp` verificati dal **contenuto** (magic bytes), non dall'estensione; ridimensionamento server-side con Thumbnailator (che riscrive il file senza metadati); `taken_at` e posizione estratti da EXIF **prima** del ridimensionamento e salvati solo se `shareLocation = true`.

### Test di sicurezza in suite

Senza token → `401`; non membro → `403`; membro che chiude il viaggio → `403`; injection e XSS come sopra.

---

## 8. Frontend

### Librerie

| Esigenza | Scelta |
|---|---|
| Routing | React Router |
| Dati dal server | TanStack Query |
| HTTP | `fetch` + wrapper `api.ts` (Bearer, Problem Details → errori tipizzati) |
| Form | React Hook Form + Zod |
| Stile | CSS Modules + variabili CSS per i token (definiti con Impeccable; prompt per Stitch in fase di implementazione) |
| Date | date-fns, locale `it` |
| Mappa (v2) | react-leaflet + OpenStreetMap |
| WebSocket (v3) | @stomp/stompjs |

### Struttura

```
src/
  app/            router, provider, layout
  features/
    auth/  trips/  expenses/  todos/(v2)  photos/(v2)  notifications/(v2)  chat/(v3)
  shared/
    api/   ui/   utils/
```

Ogni feature: pagine, componenti, hook, chiamate API.

### Pagine

| Route | v | Contenuto |
|---|---|---|
| `/login`, `/register` | 1 | form; redirect alla pagina richiesta dopo il login |
| `/join/:code` | 1 | anteprima + "Entra"; login prima se necessario |
| `/trips` | 1 | i miei viaggi + "Nuovo viaggio" |
| `/trips/:id` | 1 | dashboard: totale, mio saldo, ultime spese, membri, codice invito |
| `/trips/:id/expenses` | 1 | lista + FAB "+"; form spesa a tutto schermo |
| `/trips/:id/balances` | 1 | saldi + trasferimenti suggeriti con "Salda" |
| `/trips/:id/todos` | 2 | liste valigia / generali |
| `/trips/:id/photos` | 2 | galleria + toggle mappa |
| `/notifications` | 2 | lista; badge non lette nell'header |
| `/trips/:id/chat` | 3 | chat |

### Stato

| Tipo | Dove |
|---|---|
| Utente + token | `AuthContext` (unico Context) |
| Dati dal server | TanStack Query, chiavi `['trips', id, 'expenses']` |
| UI locale | `useState` |

Niente Redux.

### Mobile-first

- Colonna singola da 360 px; sidebar da 1024 px.
- Tab bar in basso su mobile (Spese · Saldi · Liste · Foto); header su desktop.
- Azione principale come bottone flottante.
- Form spesa in 10 secondi: importo grande, pagante = io, diviso tra tutti di default.

### Errori e stati

| Situazione | Comportamento |
|---|---|
| `401` | logout + redirect `/login` |
| `403` / `404` | pagina "Non hai accesso" |
| `400` validazione | messaggi sotto i campi |
| Backend addormentato | skeleton + "Il server si sta svegliando…" dopo 5 s |
| Liste vuote | `EmptyState` con invito all'azione |

---

## 9. Test

### Backend

| Livello | Strumenti | Copre |
|---|---|---|
| Unit | JUnit 5, AssertJ | `BalanceCalculator`: Σ netti = 0; equa con resto per 2/3/7; spesa tra alcuni; rimborso parziale e totale; viaggio vuoto; ≤ n−1 trasferimenti; determinismo. Codici invito. Ridimensionamento foto |
| Service | Mockito | invariante quote; `TripAccessService`; viaggio `CLOSED`; soft delete / restore |
| Integrazione | `@SpringBootTest`, Testcontainers Postgres, MockMvc | register → login → crea viaggio → join → spesa → saldi; test di sicurezza |

Obiettivo: 100 % sul motore dei saldi, 60–80 % sul resto del core.

### Frontend

Vitest + React Testing Library + MSW: `formatMoney`, `formatDate`, validazione Zod del form spesa, pagina saldi con dati finti, flusso di login.

---

## 10. Deploy, documentazione, metodo

### Deploy (Render, free)

| Componente | Tipo | Note |
|---|---|---|
| Backend | Web Service Docker | `Dockerfile` multi-stage (Maven → JRE 25); health `/actuator/health` |
| Frontend | Static Site | `npm run build`; rewrite `/* → /index.html` |
| Database | PostgreSQL | Flyway all'avvio |
| Config | `render.yaml` | `DATABASE_URL`, `JWT_SECRET` (generato), `CORS_ORIGIN` |
| Locale | `docker-compose.yml` (solo Postgres) | `./mvnw spring-boot:run` + `npm run dev` |

Deploy automatico da `main`. Il primo deploy ("Hello") si fa il giorno 1.

### Documentazione

| File | Contenuto |
|---|---|
| `README.md` | descrizione con emoji, mission, link demo, screenshot, stack, istruzioni clone/run, struttura, roadmap, Sicurezza e Privacy, link Swagger |
| `CLAUDE.md` | convenzioni di lavoro: stack, comandi, struttura, regole (BigDecimal, Flyway, feature packages, TDD, commit fatti dall'autrice) |
| `docs/decisioni.md` | registro decisioni (ADR leggero) |
| `docs/superpowers/specs/` | specifiche |
| `docs/superpowers/plans/` | piani di implementazione |

### Metodo

1. Spec approvata → piano con task da 1–2 h, test prima del codice.
2. Board Trello **SplitTrip**: `Backlog · v1 · v2 · v3 · In corso · Fatto`; una card per task (creata dopo il piano, con approvazione).
3. TDD; un commit per task, eseguito dall'autrice; tag `v1.0`, `v2.0`, `v3.0`.
4. Chiusura versione: deploy, README, `decisioni.md`.

### Piano temporale

| Giorni | Obiettivo |
|---|---|
| 1 | setup: Flyway, Security + JWT, Docker, deploy "Hello" |
| 2–4 | v1 backend + test |
| 5–7 | v1 frontend + grafica → `v1.0` |
| 8–10 | v2 → `v2.0` |
| 11–12 | v3 → `v3.0` |
| 13–14 | rifinitura, README, presentazione |

---

## 11. Fuori scopo

Valute multiple e conversioni; refresh token; invito via email; notifiche push; cancellazione account; percentuali e quote "a parti" nelle spese; modalità offline; storage esterno delle foto (valutato, vedi D-07).
