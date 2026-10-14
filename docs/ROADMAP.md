# SplitTrip — Roadmap di prodotto

**Data:** 13 ottobre 2026 · **Stato:** proposta, in attesa di approvazione · **Riferimenti:** spec `docs/superpowers/specs/2026-10-12-splittrip-design.md`, decisioni `docs/decisioni.md`, piano v1 `docs/superpowers/plans/2026-10-12-v1-core.md`

> Posizionamento proposto: **"Tricount divide i conti, noi ci occupiamo del viaggio."** La mission già approvata («accompagnare i gruppi di amici in ogni fase della vacanza…») è coerente: questa roadmap la estende, non la cambia.

---

## 0. Premessa: due orizzonti diversi

| Orizzonte | Scadenza | Obiettivo |
|---|---|---|
| **Capstone** | 26 ottobre 2026 (13 giorni) | v1 Core quasi finita (19 task su 21), poi v2 e v3 come da spec. Va consegnato qualcosa di **completo e solido**, non di vasto |
| **Prodotto** | dopo la consegna | le 14 funzionalità di questo documento |

La raccomandazione di fondo è: **non ampliare lo scope del capstone**, ma fare subito le poche modifiche al modello dati che costerebbero care più avanti (sezione 3.1), e al massimo anticipare 1–2 funzioni distintive che sono pura logica di dominio, quindi economiche e ottime in presentazione (sezione 4.1).

---

## 1. Analisi del progetto esistente

### Stack

| Livello | Tecnologia |
|---|---|
| Backend | Java 25, Spring Boot 4.1 (WebMVC, Data JPA/Hibernate 7.4, Security 7.1 + OAuth2 Resource Server per JWT HS256, Validation, Actuator), Flyway, PostgreSQL 16, springdoc-openapi |
| Frontend | React 19, TypeScript 6, Vite 8, React Router 8, TanStack Query 5, React Hook Form + Zod 4, date-fns, CSS con token (nessun framework), DM Sans + Material Symbols |
| Test | JUnit 5, Mockito, Testcontainers, MockMvc (66 test BE); Vitest + Testing Library + MSW (19 test FE) |
| Deploy | Render (backend Docker, frontend statico, Postgres free) |

### Struttura

```
BE/src/main/java/com/splittrip/
  auth/      JWT, Spring Security, registrazione/login, rate limiting
  user/      utenti, /me
  trip/      viaggi, membri, codice invito, controllo accessi
  expense/   spese, quote, rimborsi, motore dei saldi, cestino
  common/    errori Problem Details, Clock, OpenAPI, DATABASE_URL
FE/src/
  app/       router, layout, RequireAuth, banner "server si sveglia"
  features/  auth · trips · expenses · balances
  shared/    api client, tipi, formati, componenti UI
```

### Modello dati attuale (Flyway `V1__core.sql`)

| Tabella | Campi principali | Relazioni |
|---|---|---|
| `users` | email, password_hash, display_name | — |
| `trips` | name, destination, start/end_date, **currency (una sola)**, invite_code, status | owner → users |
| `trip_members` | role (ORGANIZER/MEMBER), joined_at | trip, **user (obbligatorio)** |
| `expenses` | description, amount, date, category, split_type (EQUAL/CUSTOM), deleted_at | trip, **payer → users**, created_by → users |
| `expense_shares` | amount | expense, **user → users** |
| `settlements` | amount, date, note, deleted_at | trip, **from/to → users** |

Punto chiave per tutto quello che segue: **i soldi puntano agli utenti (`users`), non ai partecipanti del viaggio.** Ospiti, coppie con quota unica e cassa comune non hanno un account: con lo schema attuale non possono pagare né avere una quota.

Punto di forza: **le quote sono salvate esplicitamente** (anche la divisione equa) e il motore dei saldi legge solo importi già divisi. Ogni nuovo modo di dividere (pesi, giorni, voci di scontrino) si aggiunge **calcolando le quote in modo diverso**, senza toccare il motore.

### API esistenti

`/api/auth/register|login`, `/api/me`, `/api/trips` (CRUD, stato, join con codice, rigenera codice, rimozione membri), `/api/trips/{id}/expenses` (CRUD, filtro categoria, cestino, ripristino), `/api/trips/{id}/settlements`, `/api/trips/{id}/balances`, `/api/trips/{id}/summary`. Documentate in Swagger.

### Autenticazione

Registrazione obbligatoria (email + password BCrypt), JWT stateless 24 h, id utente sempre dal token, autorizzazione per viaggio (`TripAccessService`), rate limiting sul login.

### Funzionalità implementate (v1)

Viaggi con stato e codice invito; spese divise in parti uguali o importi personalizzati; rimborsi; saldi netti con trasferimenti minimi suggeriti e «Salda»; cestino con ripristino; viaggio chiuso in sola lettura; interfaccia mobile-first accessibile.

---

## 2. Gap analysis

Legenda: ✅ presente · 🟡 parziale · ❌ assente · Complessità: **B** bassa · **M** media · **A** alta

| # | Funzionalità | Stato | Cosa c'è | Cosa serve | Compl. |
|---|---|---|---|---|---|
| 1 | Accesso ospite via link, poi conversione in utente | 🟡 | link/codice d'invito, ma richiede account | partecipanti senza account (vedi 3.1), token ospite legato al viaggio, flusso di "rivendicazione" del partecipante alla registrazione | M |
| 2 | Offline con sync | ❌ | TanStack Query (cache solo in memoria) | id generati dal client, coda di mutazioni persistente, endpoint idempotenti, versione per i conflitti, service worker | A |
| 3 | Multi-valuta con tasso del giorno salvato | ❌ | una valuta per viaggio (D-04) | valuta + tasso + importo convertito sulla spesa, servizio tassi, conversione delle quote | M |
| 4 | Nessun limite di spese | ✅ | nessun limite | paginazione della lista (oggi carica tutto) | B |
| 5 | Divisione per giorni di presenza | ❌ | — | date arrivo/partenza per partecipante, nuovo `split_type = DAYS`, calcolo quote pesate per notti/giorni | B–M |
| 6 | Scontrino diviso per voce (OCR) | ❌ | — | righe di spesa, assegnazione righe → partecipanti, upload foto (v2), servizio OCR | A |
| 7 | Spese anticipate con promemoria | 🟡 | le spese possono già avere qualunque data | flag/filtro "prima del viaggio", promemoria (notifiche v2) | B |
| 8 | Cassa comune | ❌ | — | partecipante speciale "Cassa" (vedi 3.1): versamenti = rimborsi verso la cassa, spese pagate dalla cassa | M |
| 9 | Quote con peso (coppie, famiglie) | ❌ | — | peso per partecipante (default 1), `split_type = WEIGHT`, gruppi di partecipanti opzionali | B |
| 10 | Prima: sondaggio date, budget, lista bagagli, itinerario | 🟡 | lista bagagli prevista in v2 | sondaggi, budget stimato, liste con assegnazione (v2), giorni di itinerario | M (ciascuno B–M) |
| 11 | Durante: spese legate a giorni e foto | ❌ | — | itinerario (10), foto (v2), collegamenti | B dopo 10 |
| 12 | Dopo: link di pagamento + "Wrapped" condivisibile | 🟡 | «Salda» registra il rimborso | link PayPal.me / IBAN (+ QR EPC), riepilogo statistico, generazione immagine | M |
| 13 | Freemium con "Pass viaggio" | ❌ | — | entitlement per viaggio, feature flag lato BE e FE, pagamento (Stripe) | M–A |
| 14 | Archivio viaggi passati | 🟡 | viaggi chiusi in sola lettura e sempre consultabili | vista "archivio", filtri, export | B |

---

## 3. Evoluzione del modello dati

### 3.1 Da fare SUBITO (rimandarle renderebbe la migrazione dolorosa)

Queste modifiche non aggiungono funzioni visibili: preparano lo schema. Ogni mese di dati reali in più le rende più costose.

| # | Modifica | Perché ora | Sblocca |
|---|---|---|---|
| **S1** | **I soldi puntano ai partecipanti, non agli utenti.** `trip_members` diventa l'identità economica (`participants`): `user_id` **nullable**, `display_name` proprio, `kind` (`PERSON`, `GUEST`, `POOL`). `expenses.payer_id`, `expense_shares.user_id`, `settlements.from/to` → riferimento a `trip_members(id)` | è il cambio più invasivo: tocca tutte le tabelle dei soldi, i DTO, il motore e il frontend. Oggi si fa con una migrazione di pochi record; fra sei mesi è una migrazione di produzione delicata | ospiti (1), cassa comune (8), coppie/famiglie (9), partecipanti che non usano l'app |
| **S2** | **Valuta sulla spesa:** `expenses.currency` (default = valuta del viaggio), `fx_rate NUMERIC(18,8)` (default 1), `amount_base` (importo nella valuta del viaggio). Le quote restano in valuta del viaggio | se le spese nascono senza valuta, ricostruire a posteriori quale valuta e quale tasso valevano quel giorno è impossibile | multi-valuta (3) |
| **S3** | **Id generati dal client e versione:** le API di creazione accettano un `id` UUID dal client (creazione idempotente) e ogni riga modificabile ha `version` (optimistic locking JPA) | cambia il contratto dell'API: meglio prima che esistano client offline o app di terze parti | offline (2) |
| **S4** | **Metodo di divisione estendibile:** `expenses.split_type` accetta anche `WEIGHT`, `DAYS`, `ITEMS`; `expense_shares` aggiunge `weight NUMERIC` nullable (input usato per calcolare la quota, per poter riaprire il form) | piccolo, ma evita di dover dedurre a posteriori come era stata divisa una spesa | pesi (9), giorni (5), voci (6) |

Nessuna di queste cambia il motore dei saldi: lavora già su quote esplicite.

### 3.2 Da fare quando arriva la funzione (aggiunte senza rischio)

| Tabella / campo | Per | Note |
|---|---|---|
| `trip_members.arrival_date`, `departure_date` (nullable) | 5 | null = presente tutto il viaggio |
| `trip_members.default_weight` (default 1) | 9 | proposto come peso nel form |
| `expense_items` (expense, description, amount, quantity) + `expense_item_assignments` (item, participant, weight) | 6 | le quote della spesa si calcolano dalle righe |
| `receipts` (expense, image, ocr_status, raw_ocr_json) | 6 | riusa lo storage immagini di v2 |
| `trips.budget_per_person`, `trip_polls` + `trip_poll_options` + `trip_poll_votes` | 10 | |
| `itinerary_days` (trip, date, title, notes) + `expenses.itinerary_day_id`, `photos.itinerary_day_id` | 10, 11 | |
| `payment_handles` (participant, type PAYPAL/IBAN/SATISPAY, value) | 12 | dati personali: visibili solo ai membri del viaggio |
| `trip_entitlements` (trip, feature, source PASS/PROMO, granted_at, expires_at) + `purchases` (trip, buyer, provider_ref, amount, status) | 13 | entitlement **per viaggio**, non per utente |
| `guest_tokens` (participant, token_hash, created_at, last_seen) | 1 | il link d'invito con token ospite è una credenziale |

### 3.3 Decisioni esistenti da rivedere

| Decisione | Oggi | Con questa roadmap |
|---|---|---|
| D-02 | registrazione obbligatoria | ospiti senza registrazione (1) |
| D-03 | equa + personalizzata | + pesi, giorni, voci |
| D-04 | una valuta per viaggio | valuta per spesa, tasso salvato |
| D-05 | ingresso con codice | + link con token ospite |

Ognuna diventa una nuova riga in `decisioni.md` quando la approvi.

---

## 4. Roadmap a fasi

### 4.1 Capstone (fino al 26 ottobre) — proposta di aggiustamento minimo

| Cosa | Perché | Compl. | Costo stimato |
|---|---|---|---|
| Chiudere v1 come da piano (FE-07, DOC-01) | consegna solida | — | 1 giorno |
| **S1 + S4** nella migrazione `V2` | evitano la migrazione dolorosa; il codice v1 è fresco e coperto da test | M | 1,5 giorni |
| **S2** con un solo valore (valuta del viaggio, tasso 1) | schema pronto, nessuna UI nuova | B | 0,5 giorni |
| **Divisione per giorni (5) + pesi (9)** | pura logica di dominio, testabile al 100 %, ottima da presentare («la divisione che Splitwise non fa») | B–M | 1,5 giorni |
| v2 Social ridotta (liste con assegnazione, foto, notifiche) come da spec | già pianificata | — | come da spec |
| **v3 Live (chat)** | **da tagliare** per fare spazio a quanto sopra | — | recupera ~2 giorni |

S3 (id dal client) può restare fuori dal capstone: si fa prima di iniziare l'offline.

**Extra candidato da valutare al punto di controllo di sabato 18 ottobre (D-27)** — proposto il 14 ottobre:

| Cosa | Perché | Compl. | Costo stimato |
|---|---|---|---|
| 🎡 **«Chi offre?»**: ruota che sceglie a caso chi paga il giro (caffè, gelati) e crea la spesa con quella persona come pagante | giochino legato ai soldi veri, non un'app nell'app; ottimo in presentazione | B | ~0,5 giorni, solo frontend |

Vincoli D-24: con `prefers-reduced-motion` niente rotazione e risultato immediato; il nome scelto annunciato come testo (`role="status"`); usabile da tastiera. Scartati: quiz sulla destinazione (fuori tema), «pari o dispari» sui debiti (sembra una scommessa sui soldi veri); badge e classifiche vanno semmai nel riepilogo di fine viaggio («Wrapped», §4.2).

### 4.2 MVP di prodotto (dopo il capstone)

Il tuo candidato era: **giorni di presenza, scontrino per voce, riepilogo condivisibile.**

| Candidato | Valutazione sul codice attuale |
|---|---|
| Giorni di presenza | ✅ ottimo: piccolo, distintivo, e con la proposta 4.1 è già fatto |
| Scontrino per voce | ⚠️ alto valore ma alta complessità: serve upload immagini (v2), OCR esterno e una UI di assegnazione righe non banale. Proposta: **farlo in due tempi**: prima l'inserimento manuale delle righe (M), poi l'OCR sopra (A) |
| Riepilogo "Wrapped" | ✅ buono, ma dipende da foto e categorie: viene naturale dopo v2. Complessità M |

**MVP proposto** (complessità complessiva M–A):

1. Basi A: ospiti via link (1), multi-valuta (3), paginazione (4). L'offline (2) **no** nell'MVP: è la funzione più costosa e rischiosa, e su viaggi in città la rete c'è quasi sempre.
2. Distintive: giorni di presenza + pesi (già fatti), **cassa comune (8)**, scontrino per voce **manuale**.
3. Dopo: link di pagamento PayPal.me/IBAN (12, parte economica).

Dipendenze: 1 ← S1 · 3 ← S2 · 8 ← S1 · 6-manuale ← S4 · 12-link ← nessuna.

### 4.3 Fase 2

| Funzione | Dipende da | Compl. |
|---|---|---|
| OCR scontrini (6) | 6-manuale, foto v2 | A |
| Riepilogo "Wrapped" esportabile (12) | foto v2, mappa v2 | M |
| Sondaggio date, budget, itinerario (10) | — | M |
| Spese e foto collegate ai giorni (11) | itinerario | B |
| Spese anticipate con promemoria (7) | notifiche v2 | B |
| Archivio (14) | — | B |

### 4.4 Fase 3

| Funzione | Dipende da | Compl. |
|---|---|---|
| Offline con sync (2) | S3 | A |
| Pass viaggio ed entitlement (13) | Wrapped e OCR come contenuti premium | M–A |
| App native (wrapper) | offline | A |

---

## 5. Scelte tecniche e rischi

### Librerie e servizi

| Esigenza | Proposta | Alternative | Note |
|---|---|---|---|
| Offline / sync | TanStack Query con persistenza (IndexedDB) + coda di mutazioni con id client e retry; service worker con Workbox | local-first completo (Dexie + sync custom, RxDB, PowerSync) | partire semplice: le spese sono quasi sempre "solo aggiunta", i conflitti veri riguardano modifiche concorrenti → `version` + "ultima scrittura vince" con avviso |
| Tassi di cambio | **Frankfurter** (dati BCE, gratuito, senza chiave, storico giornaliero) | exchangerate.host, Open Exchange Rates | tasso salvato sulla spesa, mai ricalcolato; cache giornaliera lato BE |
| OCR scontrini | **modello vision multimodale** (es. Claude) che restituisce le righe in JSON | Mindee Receipt API, Google Document AI, AWS Textract; Tesseract.js (scarso sugli scontrini) | sempre una schermata di verifica prima di salvare; costo per scontrino → buon candidato per il Pass |
| Immagine "Wrapped" | **satori + resvg** lato server (JSX → SVG → PNG) | html-to-image nel browser, Puppeteer | formato 1080×1920 per le storie |
| Link di pagamento | PayPal.me, IBAN con **QR EPC** (bonifico SEPA precompilato) | Satispay (nessun link P2P pubblico affidabile), Revolut | solo link e copia: l'app non tocca i soldi |
| Pagamenti in-app | **Stripe Checkout** (web) | Lemon Squeezy, Paddle (merchant of record, gestiscono l'IVA) | sulle app native i beni digitali richiedono gli acquisti in-app di Apple/Google |

### Rischi principali

| Rischio | Impatto | Mitigazione |
|---|---|---|
| **Arrotondamenti con valute diverse** | saldi che non tornano di qualche centesimo | convertire **il totale** della spesa nella valuta del viaggio con il tasso salvato, poi dividere con lo splitter esistente (centesimi interi, resto deterministico); mai convertire quota per quota |
| **Conflitti offline** | spese duplicate o modifiche perse | id dal client (idempotenza), `version`, interfaccia che mostra "in attesa di sincronizzazione" e i conflitti |
| **Sicurezza degli ospiti** | chi ha il link entra nel viaggio | token ospite per dispositivo, revocabile; il link d'invito può scadere e si rigenera (già c'è); un ospite non vede dati di altri viaggi |
| **Privacy (GDPR)** | ospiti senza account, IBAN, foto | minimizzazione, cancellazione del partecipante, IBAN visibile solo ai membri, informativa |
| **Qualità OCR** | righe sbagliate → saldi sbagliati | sempre conferma manuale, somma righe = totale verificata come oggi per le quote |
| **Regole degli store** | rifiuto dell'app nativa se il Pass si compra fuori dagli store | restare web (PWA) finché il modello non è validato |
| **Scope del capstone** | consegnare 14 funzioni a metà | fare nel capstone solo 4.1 |

---

## 6. Prossimo passo

Questo documento è una proposta: nessun file di codice è stato modificato. Serve la tua decisione su tre punti:

1. Approvi la linea "capstone invariato + S1/S2/S4 + giorni e pesi, tagliando la chat"?
2. L'MVP di prodotto proposto (4.2) ti convince, o vuoi tenere lo scontrino con OCR già nell'MVP?
3. Le decisioni da rivedere (3.3) vanno registrate ora in `decisioni.md` o quando partono le funzioni?

Dopo l'approvazione: spec aggiornata → piano di implementazione → card Trello, come per la v1.
