# SplitTrip – Card Trello (v1 Core)

Board: https://trello.com/b/rel5oKVP/splittrip

## Come si usa

1. Liste: **v1 Core · v2 Social · v3 Live · In corso · Fatto**. Etichette: **SETUP**, **BE**, **FE**, **DOC**.
2. Le card di v1 vanno nella lista «v1 Core» nell'ordine qui sotto (è l'ordine di esecuzione). Le card di v2 e v3 arrivano con i rispettivi piani.
3. Ogni card: **Descrizione** con obiettivo, riferimenti, dipendenze e criterio di «fatto»; checklist **Passi**.
4. Regola: una card va in «Fatto» solo con test verdi e commit fatto.

Riferimenti: spec = `docs/superpowers/specs/2026-10-12-splittrip-design.md`; piano = `docs/superpowers/plans/2026-10-12-v1-core.md`.

## 1. Titoli per lista

### v1 Core

```
SETUP-01 · Progetto base: rinomina, dipendenze, Flyway, DB locale
SETUP-02 · Errori comuni in Problem Details
BE-01 · Sicurezza: JWT, SecurityFilterChain, CORS, 401/403
SETUP-03 · Docker, render.yaml e primo deploy
BE-02 · Utenti: registrazione, login, /me
BE-03 · Rate limiting su /api/auth
BE-04 · Viaggi: entità, creazione, lista, dettaglio, controllo accessi
BE-05 · Viaggi: modifica e stato, cancellazione, join, membri
BE-06 · Motore dei saldi (classi pure)
BE-07 · Spese: CRUD, quote, soft delete, cestino
BE-08 · Rimborsi
BE-09 · Saldi e riepilogo
BE-10 · Swagger, test di sicurezza, registro decisioni
FE-01 · Base frontend: client API, auth, router, test, prompt Stitch
FE-02 · Login e registrazione
FE-03 · Viaggi: lista, nuovo viaggio, ingresso con codice
FE-04 · Dettaglio viaggio: layout a tab, dashboard, impostazioni
FE-05 · Spese: lista, form, modifica, cestino
FE-06 · Saldi, «Salda» e rimborsi
FE-07 · Grafica con Impeccable e rifinitura mobile
DOC-01 · README, documentazione finale, tag v1.0
```

## 2. Descrizioni e passi

#### SETUP-01 · Progetto base: rinomina, dipendenze, Flyway, DB locale

Etichetta: **SETUP**

Descrizione:

```
**Obiettivo:** Trasformare lo scaffold in SplitTrip: package com.splittrip, dipendenze definitive, schema v1 con Flyway, Postgres locale in Docker.

**Riferimento:** spec §4 (modello dati), piano Task 1

**Dipende da:** nessuna card

**Fatto quando:** `sh mvnw test` passa con SchemaTest (Testcontainers + Flyway) e l'app parte su `docker compose up -d db`.
```

Passi:

```
Riscrivere pom.xml (Boot 4.1.1, security, oauth2-resource-server, validation, actuator, flyway, springdoc, testcontainers)
Spostare la classe main in com.splittrip.SplitTripApplication con @ConfigurationPropertiesScan
application.properties con variabili d'ambiente e ddl-auto=validate
Migrazione V1__core.sql: users, trips, trip_members, expenses, expense_shares, settlements
docker-compose.yml con Postgres 16
IntegrationTest (base Testcontainers + MockMvc) e SchemaTest
CLAUDE.md e .gitignore con .DS_Store
```

#### SETUP-02 · Errori comuni in Problem Details

Etichetta: **SETUP**

Descrizione:

```
**Obiettivo:** Un solo formato di errore (RFC 9457) per tutta l'API, mai stack trace.

**Riferimento:** spec §6 (convenzioni), piano Task 2

**Dipende da:** SETUP-01

**Fatto quando:** GlobalExceptionHandlerTest passa: AppException → status/title/detail, eccezione generica → 500 senza messaggio interno.
```

Passi:

```
AppException con status e title; sottoclassi NotFound, Forbidden, Conflict, BadRequest, Unauthorized
GlobalExceptionHandler: AppException, validazione (errors[] con field/message), catch-all 500
Bean Clock (ClockConfig)
Test unitario dell'handler
```

#### BE-01 · Sicurezza: JWT, SecurityFilterChain, CORS, 401/403

Etichetta: **BE**

Descrizione:

```
**Obiettivo:** API stateless protetta da JWT HS256 (Spring Security OAuth2 Resource Server), CORS limitato al frontend, 401/403 in Problem Details.

**Riferimento:** spec §7 (sicurezza), piano Task 3, decisioni D-17 e D-21

**Dipende da:** SETUP-02

**Fatto quando:** senza token /api/trips risponde 401 problem+json; /actuator/health e /v3/api-docs sono pubblici; JwtServiceTest verifica sub ed exp a 24 h.
```

Passi:

```
JwtProperties, CorsProperties (@ConfigurationProperties)
JwtConfig: SecretKey (≥ 32 byte), NimbusJwtEncoder, NimbusJwtDecoder
JwtService.issue(userId) con claim solo sub, iat, exp
SecurityConfig: CSRF off documentato, stateless, CSP, path pubblici, oauth2ResourceServer.jwt
ProblemAuthHandlers per 401/403; annotazione @CurrentUserId
PasswordEncoder BCrypt(12); CorsConfigurationSource
Verifica manuale di Swagger con la CSP
```

#### SETUP-03 · Docker, render.yaml e primo deploy

Etichetta: **SETUP**

Descrizione:

```
**Obiettivo:** App online dal giorno 1 per scoprire subito i problemi che in locale non si vedono.

**Riferimento:** spec §10 (deploy), piano Task 4, decisione D-08

**Dipende da:** BE-01

**Fatto quando:** l'URL pubblico risponde su /actuator/health con {"status":"UP"} e Swagger si apre.
```

Passi:

```
Dockerfile multi-stage (Maven → JRE 25) e .dockerignore; prova locale con docker build/run
render.yaml: database, web service Docker (healthCheckPath, JWT_SECRET generato, CORS_ORIGIN), static site con rewrite SPA
DatabaseUrlEnvironmentPostProcessor: converte DATABASE_URL di Render in JDBC (+ test unitario)
FE/public/_redirects e FE/.env.development
Blueprint su Render, primo deploy, URL reali in render.yaml e decisioni.md (D-08)
```

#### BE-02 · Utenti: registrazione, login, /me

Etichetta: **BE**

Descrizione:

```
**Endpoint:**
- Registrazione `POST /api/auth/register`
- Login `POST /api/auth/login`
- Profilo `GET /api/me`

**Riferimento:** spec §6 (auth) e §7, piano Task 5

**Dipende da:** BE-01

**Fatto quando:** ci si registra, si entra e /me risponde; password debole → 400 con errors[]; token manomesso → 401; email già usata → 409; login sbagliato → sempre «Credenziali non valide».
```

Passi:

```
Entità User, UserRepository, UserService.require, UserResponse
RegisterRequest con regole password (8–72, lettera + cifra), LoginRequest, AuthResponse
AuthService: email normalizzata, BCrypt, 409 duplicato, 401 generico
AuthController (201 su register) e MeController
Helper di test TestUsers.register / idOf; AuthServiceTest e AuthControllerTest
```

#### BE-03 · Rate limiting su /api/auth

Etichetta: **BE**

Descrizione:

```
**Obiettivo:** Bloccare il brute force sulle password senza dipendenze esterne.

**Riferimento:** spec §7 (altre protezioni), piano Task 6, decisione D-22

**Dipende da:** BE-02

**Fatto quando:** con limite 3 la quarta richiesta a /api/auth/login dà 429 «Troppe richieste»; dopo la finestra si riapre.
```

Passi:

```
RateLimitProperties (max-requests, window)
RateLimitFilter: finestra scorrevole per IP in memoria, 429 problem+json
Registrazione del filtro prima di BearerTokenAuthenticationFilter
Test unitario con clock finto e test di integrazione con limite basso; limite alto in application-test.properties
```

#### BE-04 · Viaggi: entità, creazione, lista, dettaglio, controllo accessi

Etichetta: **BE**

Descrizione:

```
**Endpoint:**
- Lista `GET /api/trips`
- Crea `POST /api/trips`
- Dettaglio `GET /api/trips/{id}`

**Riferimento:** spec §4 (trips, trip_members) e §6, piano Task 7

**Dipende da:** BE-02

**Fatto quando:** il creatore è ORGANIZER con codice invito XXXX-XXXX; la lista mostra solo i miei viaggi; non membro → 403, viaggio inesistente → 404; date invertite → 400.
```

Passi:

```
Enum TripStatus (PLANNING → ONGOING → CLOSED) e MemberRole; entità Trip e TripMember
TripRepository (findByInviteCode, findAllByMemberUserId) e TripMemberRepository
InviteCodeGenerator (SecureRandom, senza caratteri ambigui, normalize)
TripAccessService: requireMember (404/403), requireOrganizer, requireWritable (409 se CLOSED)
DTO: TripRequest, TripPatchRequest, TripResponse, TripSummaryResponse, MemberResponse, JoinRequest, JoinPreviewResponse
TripService.create/listForUser/get e TripController
Helper TestTrips; InviteCodeGeneratorTest, TripAccessServiceTest, TripControllerTest
```

#### BE-05 · Viaggi: modifica e stato, cancellazione, join, membri

Etichetta: **BE**

Descrizione:

```
**Endpoint:**
- Modifica `PATCH /api/trips/{id}`
- Cancella `DELETE /api/trips/{id}`
- Anteprima invito `GET /api/trips/join-preview?code=`
- Entra `POST /api/trips/join`
- Nuovo codice `POST /api/trips/{id}/invite-code/regenerate`
- Rimuovi membro `DELETE /api/trips/{id}/members/{userId}`

**Riferimento:** spec §4 (regole trasversali) e §6, piano Task 8

**Dipende da:** BE-04

**Fatto quando:** lo stato avanza ma non torna indietro (409); cancellazione solo in PLANNING; join con codice in minuscolo e spazi funziona ed è idempotente; viaggio chiuso → 409; codice rigenerato invalida il vecchio; regole di rimozione membri rispettate.
```

Passi:

```
TripService.update (stato solo in avanti), delete (solo PLANNING)
joinPreview e join (normalizzazione codice, idempotente, 409 se CLOSED)
regenerateInviteCode e removeMember (organizzatore o sé stesso; mai l'organizzatore)
Endpoint in TripController (join-preview e join prima di /{tripId})
TripLifecycleTest
```

#### BE-06 · Motore dei saldi (classi pure)

Etichetta: **BE**

Descrizione:

```
**Obiettivo:** Il cuore logico dell'app: saldi netti e semplificazione greedy, senza Spring né DB, coperto al 100 % da test.

**Riferimento:** spec §5, piano Task 9, decisioni D-13 e D-14

**Dipende da:** nessuna card (ma si esegue dopo BE-05)

**Fatto quando:** EqualSplitterTest e BalanceCalculatorTest passano: esempio della spec (Marco +50, Giulia −15, Vale −35; 2 trasferimenti), Σ netti = 0, resto dei centesimi deterministico, ≤ n−1 trasferimenti.
```

Passi:

```
BalanceCalculator con record ShareInput, ExpenseInput, SettlementInput, MemberBalance, Transfer, Result
Calcolo in centesimi (long): netto = pagato − dovuto + rimborsi dati − ricevuti
Semplificazione greedy: debitore più grande → creditore più grande, ordine deterministico
EqualSplitter: parti uguali, centesimi avanzati ai primi per id
Test: esempio spec, somma zero, viaggio vuoto, rimborso totale, membro senza movimenti, n−1 e determinismo
```

#### BE-07 · Spese: CRUD, quote, soft delete, cestino

Etichetta: **BE**

Descrizione:

```
**Endpoint:**
- Lista `GET /api/trips/{id}/expenses?category=`
- Crea `POST /api/trips/{id}/expenses`
- Dettaglio `GET /api/trips/{id}/expenses/{eid}`
- Modifica `PUT /api/trips/{id}/expenses/{eid}`
- Cancella (soft) `DELETE /api/trips/{id}/expenses/{eid}`
- Cestino `GET /api/trips/{id}/expenses/trash`
- Ripristina `POST /api/trips/{id}/expenses/{eid}/restore`

**Riferimento:** spec §4 (expenses, expense_shares) e §6, piano Task 10, decisione D-15

**Dipende da:** BE-05, BE-06

**Fatto quando:** EQUAL salva le quote con il resto (33,34/33,33/33,33); CUSTOM con somma sbagliata → 400 con gli importi nel messaggio; descrizione di spazi → 400 sul campo; 3 decimali → 400; modifica/cancellazione solo autore o organizzatore; cestino solo organizzatore; ripristino bloccato se un coinvolto ha lasciato il viaggio; viaggio chiuso → 409; con spese attive né cancellazione viaggio né rimozione membro.
```

Passi:

```
Enum ExpenseCategory e SplitType; entità Expense (@SoftDelete TIMESTAMP, shares senza cascade REMOVE) ed ExpenseShare
ExpenseRepository (fetch join quote e utenti), ExpenseShareRepository, ExpenseTrashRepository con JdbcClient
DTO: ExpenseRequest, ShareRequest (@Digits 2 decimali), ExpenseResponse, ShareResponse, TrashedExpenseResponse
ExpenseService: computeShares (validazioni + EqualSplitter), create, update (quote sostituite), delete, trash, restore
ExpenseController
Controlli sulle spese in TripService.delete e removeMember
Helper TestExpenses ed ExpenseControllerTest (11 scenari)
```

#### BE-08 · Rimborsi

Etichetta: **BE**

Descrizione:

```
**Endpoint:**
- Lista `GET /api/trips/{id}/settlements`
- Crea `POST /api/trips/{id}/settlements`
- Cancella (soft) `DELETE /api/trips/{id}/settlements/{sid}`

**Riferimento:** spec §4 (settlements) e §6, piano Task 11

**Dipende da:** BE-07

**Fatto quando:** si crea, si lista e si cancella (solo autore o organizzatore); rimborso a sé stessi → 400; utenti non membri → 400; viaggio chiuso → 409.
```

Passi:

```
Entità Settlement con @SoftDelete; SettlementRepository con fetch join
SettlementRequest e SettlementResponse (con nomi)
SettlementService: validazioni, create, delete
SettlementController
SettlementControllerTest
```

#### BE-09 · Saldi e riepilogo

Etichetta: **BE**

Descrizione:

```
**Endpoint:**
- Saldi `GET /api/trips/{id}/balances`
- Riepilogo `GET /api/trips/{id}/summary`

**Riferimento:** spec §5 e §6, piano Task 12

**Dipende da:** BE-08

**Fatto quando:** l'esempio della spec, costruito via API, restituisce i netti e i trasferimenti attesi con i nomi; il riepilogo dà totale 120, per categoria e per pagante; viaggio vuoto → saldi a zero e nessun trasferimento.
```

Passi:

```
DTO: MemberBalanceResponse, TransferResponse, BalancesResponse, SummaryResponse
BalanceService: carica spese, quote e rimborsi, chiama BalanceCalculator, aggiunge i nomi
summary: totale, per categoria, per pagante
BalanceController
BalanceControllerTest
```

#### BE-10 · Swagger, test di sicurezza, registro decisioni

Etichetta: **BE**

Descrizione:

```
**Obiettivo:** Documentazione API con Authorize e prove in suite delle difese richieste dal corso.

**Riferimento:** spec §7 e §10, piano Task 13

**Dipende da:** BE-09

**Fatto quando:** Swagger ha il pulsante Authorize e funziona col token; SecurityHardeningTest passa (injection salvata come testo, XSS come testo con nosniff, id nel body ignorato, nessuno stack trace); D-21 e D-22 nel registro.
```

Passi:

```
SecurityHardeningTest (injection, XSS, id dal token, errori senza stack trace)
OpenApiConfig con schema Bearer; verifica manuale di Authorize
Eventuale handleTypeMismatch in GlobalExceptionHandler
decisioni.md: D-21 (JWT con Resource Server) e D-22 (rate limiter custom)
Suite completa verde; verifica su Render
```

#### FE-01 · Base frontend: client API, auth, router, test, prompt Stitch

Etichetta: **FE**

Descrizione:

```
**Obiettivo:** Fondamenta del frontend: client fetch con Bearer e Problem Details, AuthContext, router con rotte protette, Vitest + MSW, prompt per le schermate Stitch.

**Riferimento:** spec §8, piano Task 14, decisione D-19

**Dipende da:** BE-02

**Fatto quando:** client.test, format.test e RequireAuth.test passano; lint e build puliti; docs/stitch-prompt.md scritto.
```

Passi:

```
Dipendenze (react-router, TanStack Query, RHF, Zod, date-fns; vitest, testing-library, msw) e pulizia dello scaffold
vite.config.ts con proxy /api e config Vitest; setup MSW
types.ts, client.ts (ApiError, configureClient, api), format.ts (formatMoney, formatDate, formatDateRange)
authContext, AuthProvider (localStorage), useAuth, RequireAuth, Layout, NotFoundPage, routes, App, main
Test di client, formati e RequireAuth
docs/stitch-prompt.md con le 10 schermate
```

#### FE-02 · Login e registrazione

Etichetta: **FE**

Descrizione:

```
**Endpoint:**
- Login `POST /api/auth/login`
- Registrazione `POST /api/auth/register`

**Riferimento:** spec §8 (pagine, errori), piano Task 15

**Dipende da:** FE-01

**Fatto quando:** LoginPage.test passa: login salva il token e torna alla pagina richiesta; credenziali sbagliate mostrano il messaggio del server in un alert.
```

Passi:

```
Componenti Field, Button, FormError e CSS di base
authSchemas (Zod, stesse regole del backend) e authApi
LoginPage e RegisterPage (errori di campo dal Problem Details)
Rotte /login e /register; renderWithProviders per i test
Verifica manuale con backend
```

#### FE-03 · Viaggi: lista, nuovo viaggio, ingresso con codice

Etichetta: **FE**

Descrizione:

```
**Endpoint:**
- `GET /api/trips`, `POST /api/trips`, `GET /api/trips/join-preview`, `POST /api/trips/join`

**Riferimento:** spec §8, piano Task 16

**Dipende da:** FE-02, BE-05

**Fatto quando:** TripsPage.test passa: card con nome, destinazione, date italiane, stato e partecipanti; stato vuoto con link «Crea il tuo primo viaggio».
```

Passi:

```
tripsApi e hook useTrips/useTrip/useCreateTrip/useJoinTrip/useUpdateTrip/useDeleteTrip/useRegenerateCode/useRemoveMember
tripSchema (ritorno ≥ partenza)
Spinner, EmptyState, StatusBadge, TripCard
TripsPage con FAB, NewTripPage, JoinPage (anteprima + Entra, anche da /join/:code)
Rotte e CSS; verifica manuale con due utenti
```

#### FE-04 · Dettaglio viaggio: layout a tab, dashboard, impostazioni

Etichetta: **FE**

Descrizione:

```
**Endpoint:**
- `GET /api/trips/{id}`, `/summary`, `/balances`, `/expenses`; `PATCH /api/trips/{id}`; regenerate; rimozione membri; `DELETE /api/trips/{id}`

**Riferimento:** spec §8 (dashboard), piano Task 17

**Dipende da:** FE-03, BE-09

**Fatto quando:** TripDashboardPage.test passa: «Il tuo saldo» con segno e colore, totale, codice invito, membri; tab Impostazioni solo per l'organizzatore; cambio stato, nuovo codice, rimozione membro ed eliminazione con conferma in Modal.
```

Passi:

```
expensesApi e balancesApi con i rispettivi hook (chiavi ['trips', tripId, …])
Modal (<dialog>) e MoneyText (verde/corallo)
TripLayout con tab e Outlet context { trip, me, isOrganizer, canWrite }
InviteCodeBox (navigator.share / clipboard), MembersList
TripDashboardPage e TripSettingsPage
Rotte annidate sotto /trips/:tripId; polyfill showModal nei test se serve
```

#### FE-05 · Spese: lista, form, modifica, cestino

Etichetta: **FE**

Descrizione:

```
**Endpoint:**
- Tutti gli endpoint di /api/trips/{id}/expenses

**Riferimento:** spec §8 (form spesa in 10 secondi), piano Task 18

**Dipende da:** FE-04

**Fatto quando:** expenseSchema.test e ExpenseFormPage.test passano: EQUAL manda solo i partecipanti inclusi; CUSTOM con quote che non tornano è bloccato con il messaggio «mancano/avanzano»; il form crea la spesa con me come pagante e tutti inclusi di default.
```

Passi:

```
expenseSchema con parseCents, superRefine per le quote, toExpenseInput
ExpenseRow ed ExpensesPage (filtri per categoria, raggruppamento per giorno, FAB, link al cestino)
ExpenseFormPage: importo grande, pagante = io, tutti inclusi, toggle equa/personalizzata con «resta da assegnare», modifica ed eliminazione con conferma
TrashPage con ripristino
Rotte e CSS; verifica manuale
```

#### FE-06 · Saldi, «Salda» e rimborsi

Etichetta: **FE**

Descrizione:

```
**Endpoint:**
- `GET /api/trips/{id}/balances`, `GET/POST/DELETE /api/trips/{id}/settlements`

**Riferimento:** spec §5 e §8, piano Task 19

**Dipende da:** FE-05

**Fatto quando:** BalancesPage.test passa: saldi con barre, trasferimenti suggeriti «Giulia → Marco» con bottone Salda che apre il form precompilato; rimborsi registrati con annullamento.
```

Passi:

```
settlementSchema
BalancesPage: saldi con barre, «Come pareggiare» con Salda, rimborsi registrati
SettlementFormPage precompilato da query string
Rotte e CSS; verifica manuale del ciclo Salda → trasferimento sparisce
```

#### FE-07 · Grafica con Impeccable e rifinitura mobile

Etichetta: **FE**

Descrizione:

```
**Obiettivo:** Dare all'app il suo carattere: token CSS definitivi, tab bar in basso, stati vuoti, banner «server si sta svegliando», controllo a 360 e 1024 px.

**Riferimento:** spec §8 (mobile-first), piano Task 20, schermate Stitch

**Dipende da:** FE-06

**Fatto quando:** ogni pagina è usabile con una mano a 360 px senza scroll orizzontale; griglia a due colonne da 1024 px; screenshot salvati in docs/screenshots; test, lint e build verdi.
```

Passi:

```
Discutere l'accessibilità (daltonismo, lettori di schermo, tastiera) prima di scegliere colori e componenti
Skill Impeccable: token (teal, corallo «devi dare», verde «devi ricevere», cifre tabulari), applicati a index.css e shared/ui
WakingBanner (richieste > 5 s) nel Layout; RequireAuth.test con renderWithProviders
Tab bar fissa in basso su mobile, FAB sopra la barra
Controllo manuale a 360 px e 1024 px; correzioni dalla revisione Impeccable
Screenshot mobile/desktop; D-23 (font e palette) in decisioni.md
```

#### DOC-01 · README, documentazione finale, tag v1.0

Etichetta: **DOC**

Descrizione:

```
**Obiettivo:** Consegnare un repository che si capisce e si avvia leggendo solo il README, con l'app pubblicata e verificata.

**Riferimento:** spec §10 (documentazione), piano Task 21

**Dipende da:** FE-07, BE-10

**Fatto quando:** il README ha descrizione, link alla demo e a Swagger, screenshot, istruzioni di avvio, test, sicurezza e privacy, roadmap; il giro completo (registrazione → viaggio → join → spese → Salda → chiusura) funziona sull'URL pubblico; tag v1.0 pushato.
```

Passi:

```
README.md con emoji: mission, demo, funzioni v1, roadmap, screenshot, stack, avvio locale, variabili, test, sicurezza e privacy, progettazione, struttura
CLAUDE.md: sezione Stato (v1.0 pubblicata); decisioni.md aggiornato
Verifica end-to-end da telefono e desktop sull'URL pubblico
Commit e tag v1.0
```
