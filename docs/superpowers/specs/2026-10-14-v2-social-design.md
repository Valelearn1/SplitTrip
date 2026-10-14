# SplitTrip — Design v2 «Social»

**Data:** 14 ottobre 2026 · **Stato:** approvato (brainstorming) · **Spec di riferimento:** `2026-10-12-splittrip-design.md` (v1, §2 e §4/§6 «v2») e `2026-10-14-v1.5-divisioni-smart-design.md` (partecipanti)

> Prima di partire si pianifica insieme; durante si tiene traccia; al ritorno ci si ritrova con ricordi condivisi. La v2 aggiunge le liste, le foto sulla mappa e le notifiche: la parte «insieme» della missione.

---

## 1. Obiettivi e limiti

### Cosa entra

| Funzione | Origine |
|---|---|
| **Liste** condivise (Valigia / Generale) con voci spuntabili e assegnabili a un partecipante, anche senza account | spec v1 §4; D-34 |
| **Foto** del viaggio, ridotte sul telefono e ripulite sul server, con galleria e **mappa** (Leaflet + OSM, D-10) delle foto geolocalizzate con consenso | spec v1 §4, D-07; D-35 |
| **Notifiche** in-app generate da eventi interni, con campanella a polling | spec v1 §3, §4; D-36 |
| **Scontrino** allegato alla spesa, **foto profilo**, **meteo** della destinazione via Open-Meteo | extra D-25; D-37 |

### Cosa resta fuori

Album condivisibili fuori dal viaggio, commenti e reazioni sulle foto, notifiche push del browser, meteo storico, foto originali a piena risoluzione, tempo reale (v3).

### Successo

- Il gruppo prepara la valigia senza portare quattro phon: ogni cosa ha un responsabile, anche la nonna senza app.
- A fine giornata ognuno carica le foto dal telefono, in pochi secondi anche coi dati mobili; sulla mappa compaiono solo quelle per cui si è dato il consenso.
- Marco aggiunge una cena: Vale e Giulia vedono «1» sulla campanella entro un minuto, Marco no.
- Un viaggio di v1.5 funziona identico, con le nuove sezioni vuote.

---

## 2. Decisioni di design

| ID | Decisione | Alternative scartate | Motivo |
|---|---|---|---|
| D-34 | Liste di gruppo illimitate per viaggio, tipo `PACKING`/`GENERAL`, voce assegnabile a un **partecipante** (`assignee_participant_id`) | lista personale privata per ciascuno; due liste fisse | risolve il problema vero del gruppo (doppioni e dimenticanze); l'assegnatario partecipante include chi non ha l'app; la lista privata raddoppia regole e test |
| D-35 | Foto: il **telefono riduce** (1600 px, JPEG) e legge GPS/data con `exifr`; il **server ripulisce** (decodifica, riscrittura senza metadati, miniatura); coordinate salvate **solo con consenso esplicito per foto**, casella spenta di default; limite 3 MB per upload, 200 foto per viaggio, 2 elaborazioni in parallelo | tutto sul server (RAM ~48 MB per foto, upload lenti); tutto sul telefono (il server si fiderebbe del client) | upload veloci sui dati mobili, server protetto (256 MB di heap), il GPS non lascia il telefono senza consenso |
| D-36 | Notifiche scritte da un listener degli **eventi interni** (`ExpenseCreated`, `SettlementCreated`, `ParticipantJoined`, `TodoAssigned`) dopo il commit; lettura con **polling** ogni 60 s; chi agisce non riceve la propria notifica | scrivere le notifiche dentro i service dei soldi; WebSocket subito | i moduli restano disaccoppiati (spec v1 §3); in v3 lo stesso listener alimenta il WebSocket |
| D-37 | Gli extra di D-25 entrano tutti in v2: scontrino (riusa le foto), foto profilo (tabella separata), meteo (Open-Meteo, chiamato dal backend con cache) | solo scontrino; nessuno | la v1.5 è stata chiusa in un giorno: c'è margine; sono i pezzi più «da demo»; il checkpoint del 18 (D-27) resta il momento per tagliare |

Navigazione (D-26 aggiornata): barra a cinque voci (Panoramica · Spese · Saldi · Liste · Foto); Impostazioni diventa un'icona nell'intestazione del viaggio; Notifiche è la campanella nell'header dell'app.

---

## 3. Modello dati — migrazione `V4__social.sql`

Convenzioni della spec v1 §4. Hard delete per tutto il contenuto social (D-15); cancellare un viaggio elimina tutto a cascata.

### `todo_lists`

| Colonna | Tipo | Note |
|---|---|---|
| `id` | UUID | |
| `trip_id` | UUID | FK `trips`, `ON DELETE CASCADE`; indice |
| `title` | VARCHAR(60) | |
| `type` | VARCHAR(16) | `CHECK IN ('PACKING','GENERAL')` |
| `created_by` | UUID | FK `users` |
| `created_at` | TIMESTAMPTZ | |

### `todo_items`

| Colonna | Tipo | Note |
|---|---|---|
| `id` | UUID | |
| `list_id` | UUID | FK `todo_lists`, `ON DELETE CASCADE`; indice |
| `text` | VARCHAR(120) | |
| `done` | BOOLEAN | default false |
| `assignee_participant_id` | UUID nullable | FK `participants`; se il partecipante lascia il viaggio l'assegnazione resta visibile come «(ha lasciato)» |
| `created_by` | UUID | FK `users` |
| `created_at`, `updated_at` | TIMESTAMPTZ | |

### `photos`

| Colonna | Tipo | Note |
|---|---|---|
| `id` | UUID | |
| `trip_id` | UUID | FK `trips`, `ON DELETE CASCADE`; indice `(trip_id, created_at desc)` |
| `uploader_id` | UUID | FK `users` |
| `kind` | VARCHAR(8) | `CHECK IN ('PHOTO','RECEIPT')` |
| `expense_id` | UUID nullable | FK `expenses` `ON DELETE CASCADE`; `CHECK ((kind = 'RECEIPT') = (expense_id IS NOT NULL))`; **indice unico parziale** su `expense_id WHERE kind = 'RECEIPT'` |
| `image` | BYTEA | JPEG riscritto dal server, lato lungo ≤ 1600 px, qualità 85, senza metadati |
| `thumbnail` | BYTEA | JPEG, lato lungo 300 px |
| `width`, `height` | INTEGER | dell'immagine salvata |
| `caption` | VARCHAR(200) nullable | |
| `taken_at` | TIMESTAMPTZ nullable | dal telefono (EXIF letto da `exifr`) |
| `latitude`, `longitude` | NUMERIC(9,6) nullable | `CHECK ((latitude IS NULL) = (longitude IS NULL))`, `latitude BETWEEN -90 AND 90`, `longitude BETWEEN -180 AND 180` |
| `created_at` | TIMESTAMPTZ | |

### `user_avatars`

| Colonna | Tipo | Note |
|---|---|---|
| `user_id` | UUID PK | FK `users`, `ON DELETE CASCADE` |
| `image` | BYTEA | JPEG 256×256 |
| `updated_at` | TIMESTAMPTZ | |

Tabella separata: le query su `users` non trasportano byte.

### `notifications`

| Colonna | Tipo | Note |
|---|---|---|
| `id` | UUID | |
| `user_id` | UUID | FK `users`, `ON DELETE CASCADE` |
| `trip_id` | UUID | FK `trips`, `ON DELETE CASCADE` |
| `type` | VARCHAR(24) | `CHECK IN ('EXPENSE_ADDED','SETTLEMENT_ADDED','PARTICIPANT_JOINED','TODO_ASSIGNED')` |
| `message` | VARCHAR(200) | già composta in italiano: «Marco ha aggiunto Cena (tua quota 22,50 €)» |
| `link` | VARCHAR(200) | percorso nell'app, es. `/trips/{id}/expenses/{eid}/edit` |
| `read_at` | TIMESTAMPTZ nullable | |
| `created_at` | TIMESTAMPTZ | indice `(user_id, read_at, created_at desc)` |

### `trips`

`latitude`, `longitude` NUMERIC(9,6) nullable: coordinate della destinazione, calcolate con il geocoding di Open-Meteo al primo uso del meteo e poi riutilizzate. Le previsioni non si salvano.

### Spazio

Una foto occupa ~300 KB + ~20 KB di miniatura: ~3000 foto nel DB free da 1 GB. Limite di **200 foto per viaggio** → 409 «Questo viaggio ha raggiunto il limite di 200 foto».

---

## 4. Backend

### Package

| Package | Responsabilità |
|---|---|
| `todo/` | `TodoList`, `TodoItem`, service, controller, DTO |
| `photo/` | `Photo`, `ImageProcessor` (pura), `PhotoService`, controller, repository con query sui metadati (senza byte) |
| `notification/` | `Notification`, `NotificationListener` (eventi → righe), service, controller |
| `weather/` | `OpenMeteoClient`, `WeatherService` (cache 1 h per viaggio), controller |
| `user/` | `UserAvatar`, upload e lettura avatar |
| `common/events/` | record degli eventi: `ExpenseCreated(tripId, expenseId, actorUserId, description, shares)`, `SettlementCreated(...)`, `ParticipantJoined(...)`, `TodoAssigned(...)` |

### Eventi interni (spec v1 §3, D-36)

I service di `expense`, `trip` e `todo` pubblicano l'evento con `ApplicationEventPublisher` nella stessa transazione. `NotificationListener` è `@TransactionalEventListener(phase = AFTER_COMMIT)` e scrive le righe in una transazione propria (`REQUIRES_NEW`): se la notifica fallisce, l'operazione originale resta valida.

| Evento | Destinatari | Mai |
|---|---|---|
| `ExpenseCreated` | partecipanti con una quota **che hanno un account** | chi ha creato la spesa |
| `SettlementCreated` | chi dà e chi riceve, se hanno un account | chi l'ha registrato |
| `ParticipantJoined` (ingresso o rivendicazione) | tutti gli attivi con account | chi è entrato |
| `TodoAssigned` | l'assegnatario, se ha un account | chi assegna a sé stesso |

### Pipeline immagine (`ImageProcessor`, classe pura)

1. `Content-Length` e dimensione reale ≤ 3 MB → altrimenti 413.
2. Tipo dedotto dai **primi byte** (JPEG `FF D8`, PNG `89 50 4E 47`, WebP `RIFF…WEBP`); estensione e `Content-Type` dichiarato ignorati → altrimenti 400 «Il file non è un'immagine».
3. Decodifica con `ImageIO` (WebP tramite `imageio-webp` di TwelveMonkeys) → se fallisce 400.
4. Se il lato lungo supera 1600 px, ridimensionamento con interpolazione bilineare.
5. Riscrittura JPEG qualità 85 **senza metadati** (un `BufferedImage` nuovo non ne ha).
6. Miniatura 300 px, stesso metodo; avatar: ritaglio centrale quadrato, 256 px.

Esecuzione fuori dalla transazione, con `Semaphore(2)`; il terzo upload contemporaneo aspetta.

### API

Sotto `/api/trips/{tripId}` salvo dove indicato. Tutti richiedono il Bearer; `requireMember` in testa.

| Metodo | Percorso | Chi | Note |
|---|---|---|---|
| GET | `/todo-lists` | membro | liste con le voci (`items[]`), voci ordinate: da fare per `created_at`, poi fatte |
| POST | `/todo-lists` | membro | `{title, type}` → 201; 409 se viaggio chiuso |
| PATCH / DELETE | `/todo-lists/{lid}` | membro | `{title?}`; DELETE rimuove le voci |
| POST | `/todo-lists/{lid}/items` | membro | `{text, assigneeParticipantId?}` → 201; 400 se il partecipante non è attivo nel viaggio |
| PATCH / DELETE | `/todo-lists/{lid}/items/{iid}` | membro | `{text?, done?, assigneeParticipantId?, clearAssignee?}`; `clearAssignee: true` toglie l'assegnazione (campi assenti = non toccare, come `ParticipantPatchRequest`) |
| GET | `/photos?kind=PHOTO\|RECEIPT&withLocation=true` | membro | metadati (`id, kind, expenseId, uploaderId, uploaderName, caption, takenAt, latitude, longitude, width, height, createdAt`), dalla più recente; default `kind=PHOTO` |
| POST | `/photos` | membro | `multipart/form-data`: `file`, `caption?`, `takenAt?` (ISO), `latitude?`+`longitude?` (solo se consentito), `expenseId?` → `kind=RECEIPT`. 409 se esiste già uno scontrino per quella spesa o se si supera il limite; 409 se viaggio chiuso |
| GET | `/photos/{pid}/image`, `/photos/{pid}/thumbnail` | membro | `image/jpeg`, `Cache-Control: private, max-age=31536000, immutable`, `ETag` = id |
| DELETE | `/photos/{pid}` | autore o organizzatore | hard delete, 403 altrimenti |
| GET | `/weather` | membro | `{days: [{date, code, tMin, tMax}]}` per i giorni del viaggio nei prossimi 16; `{days: []}` se destinazione non trovata o servizio non raggiungibile |
| GET | `/api/notifications?unread=true` | loggato | le ultime 50 dell'utente |
| GET | `/api/notifications/unread-count` | loggato | `{count}` |
| PATCH | `/api/notifications/{nid}/read` | destinatario | 404 se di un altro utente |
| POST | `/api/notifications/read-all` | loggato | |
| PUT / DELETE | `/api/me/avatar` | loggato | multipart `file`; stessa pipeline, 256×256 |
| GET | `/api/users/{uid}/avatar` | loggato | 404 se non ha avatar o se non condivide alcun viaggio con chi chiede; stessi header di cache |

Le risposte delle spese aggiungono `receiptPhotoId` (nullable); `ParticipantResponse` e `UserResponse` aggiungono `hasAvatar`.

### Meteo

`OpenMeteoClient` (RestClient): geocoding `https://geocoding-api.open-meteo.com/v1/search?name=<destinazione>&count=1&language=it`, poi `https://api.open-meteo.com/v1/forecast?latitude&longitude&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=16`. Timeout 3 s connessione e lettura. Cache in memoria (`ConcurrentHashMap` con scadenza) per `tripId`, 1 h. Le coordinate trovate si salvano su `trips` e il geocoding non si ripete; se cambia la destinazione si azzerano.

### Autorizzazione

| Regola | Dettaglio |
|---|---|
| `assigneeParticipantId`, `expenseId` | devono appartenere al viaggio (attivo / non nel cestino) → 400 |
| foto e miniature | solo membri, via Bearer; nessun URL pubblico |
| avatar | solo a chi condivide almeno un viaggio attivo con l'utente |
| notifiche | sempre filtrate per `user_id` del token |
| viaggio chiuso | niente nuove liste, voci, foto; spuntare una voce resta permesso (non tocca i soldi) |

---

## 5. Frontend

### Navigazione

| Dove | Voci |
|---|---|
| barra in basso (mobile) / segmentata (desktop) | Panoramica · Spese · Saldi · Liste · Foto |
| intestazione del viaggio | icona ingranaggio → Impostazioni (`aria-label` «Impostazioni del viaggio») |
| header dell'app | campanella con contatore → `/notifications`; avatar → profilo |

### Librerie nuove

`leaflet` + `react-leaflet` (mappa), `exifr` (GPS e data dalla foto nel browser). CSS di Leaflet importato nel bundle.

### Pagine e componenti

| Pagina / componente | Comportamento |
|---|---|
| `TodoListsPage` | una card per lista (icona 🧳 Valigia / ✅ Generale, titolo, «3/8 fatte»); voci con checkbox, testo, avatar dell'assegnatario; menu per assegnare (lista dei partecipanti attivi, «Nessuno»); campo «Aggiungi voce» in fondo con invio da tastiera; filtro «Solo le mie»; «Nuova lista» con titolo e tipo; rinomina ed elimina dal menu della card. Le voci fatte scendono in fondo, barrate, con «fatto» per i lettori di schermo |
| `PhotosPage` | interruttore **Griglia / Mappa**; griglia di `AuthImage` (miniature) 3 per riga su mobile; mappa Leaflet con marcatori per le foto con posizione, popup con miniatura e didascalia, zoom automatico sui marcatori; sotto la mappa la stessa lista in forma testuale (accessibilità); FAB «Carica foto» |
| `PhotoViewer` | `<dialog>` a schermo intero: immagine grande, didascalia, «caricata da … il …», «Elimina» per autore e organizzatore (conferma) |
| `PhotoUploadSheet` | `<input type="file" accept="image/*" multiple>`; per ogni file: `exifr` → GPS e `DateTimeOriginal`; canvas → JPEG 1600 px qualità 0,85; anteprima; didascalia; casella **«Mostra sulla mappa dove è stata scattata»** spenta di default, visibile solo se c'è il GPS; se non c'è, pulsante «Usa la mia posizione attuale» (`navigator.geolocation`, con permesso del browser); coda con barra di avanzamento, una foto alla volta; errori per file (413/409) mostrati sulla singola foto |
| `AuthImage` | `fetch` con Bearer via TanStack Query (`staleTime: Infinity`), `URL.createObjectURL`, `revokeObjectURL` allo smontaggio; segnaposto grigio con `aria-busy`; `alt` dalla didascalia o «Foto di {autore}» |
| Scontrino nel form spesa | sezione «Scontrino» con miniatura, «Carica» / «Sostituisci» / «Rimuovi»; nella riga spesa icona 🧾 con `aria-label` «con scontrino». Si carica dopo il salvataggio della spesa (serve l'id): nel form di creazione la sezione dice «Salva la spesa per allegare lo scontrino» |
| Meteo nella Panoramica | card `WeatherCard`: una colonna per giorno (giorno della settimana, icona dal `weather_code`, min/max); visibile solo se `days` non è vuoto; testo alternativo per ogni icona («nuvoloso») |
| `NotificationsPage` + `NotificationBell` | campanella con `aria-label` «Notifiche, N non lette»; polling di `unread-count` ogni 60 s solo con scheda visibile (`document.visibilityState`); lista con non lette in grassetto e puntino teal; tocco → `read` + navigazione al `link`; «Segna tutte come lette» |
| Avatar | `Avatar` mostra `AuthImage` dell'avatar se `hasAvatar`, altrimenti le iniziali; pagina profilo (menu in alto a destra) con caricamento, ritaglio quadrato nel browser, rimozione |

### Accessibilità (D-24)

Marcatori con etichetta testuale e lista sotto la mappa; stato dell'upload in `role="status"`; `prefers-reduced-motion` disattiva le animazioni di zoom della mappa; tutte le icone meteo con testo; contrasto dei popup verificato.

### CSP (`render.yaml`)

`img-src 'self' data: blob: https://tile.openstreetmap.org`; `connect-src` invariato (Open-Meteo è chiamato dal backend).

---

## 6. Sicurezza e privacy

| Rischio | Difesa |
|---|---|
| file malevolo travestito | tipo dai primi byte, decodifica obbligatoria, riscrittura: nel DB solo JPEG generati dal server |
| upload enormi o a raffica | 3 MB, 200 foto/viaggio, `Semaphore(2)`; 413 / 409 con messaggi in italiano |
| posizione (dato personale) | solo con consenso per foto; EXIF mai conservati; sparisce con la foto |
| immagini senza login | Bearer + `requireMember` su ogni byte; niente token in query string |
| avatar a estranei | solo chi condivide un viaggio |
| notifiche altrui | filtro per `user_id` del token, 404 |
| API esterna | timeout 3 s, cache, solo il nome della destinazione inviato |
| XSS | escape di React + lunghezze massime (didascalie 200, voci 120, titoli 60) |

---

## 7. Test

| Livello | Cosa |
|---|---|
| Unitari | `ImageProcessor`: PNG → JPEG senza EXIF, JPEG con EXIF → senza, ridimensionamento 4000→1600, miniatura 300, file di testo → errore, WebP decodificato, avatar 256×256 quadrato; `NotificationListener`: messaggi in italiano e destinatari (mai chi agisce; mai chi non ha account) |
| Migrazione | `MigrationV4Test`: tabelle e vincoli, indice unico dello scontrino, cancellazione del viaggio con foto, liste e notifiche in cascata |
| Integrazione | liste (CRUD, assegnazione a partecipante senza account, `null`, partecipante di altro viaggio → 400, viaggio chiuso → 409); foto (upload con consenso → coordinate; senza → null; `withLocation`; download senza Bearer → 401; delete 403/204; scontrino doppio → 409; limite 200 → 409 con un contatore forzato nel test); notifiche (spesa → quote con account, non il creatore; rimborso; ingresso; assegnazione; lettura 404 altrui; `read-all`); avatar (solo chi condivide un viaggio); meteo con `MockRestServiceServer` (ok, timeout → `days: []`, destinazione non trovata → `days: []`) |
| Frontend | riduzione canvas (mock), consenso GPS spento di default e coordinate assenti nel body, `AuthImage` con Bearer e `revokeObjectURL`, liste (spunta, assegna, filtro mie), campanella (contatore, click → read + navigazione), `WeatherCard` nascosta senza dati |
| Sicurezza | `SecurityHardeningTest` esteso: XSS in didascalia e voce; id utente dal token sull'upload |

---

## 8. Consegna

| Passo | Dettaglio |
|---|---|
| Decisioni | D-34…D-37 in `decisioni.md`; nota su D-26 (navigazione) |
| Migrazione | `V4__social.sql` nel primo task backend; testata; applicata da Render al push |
| Render | CSP aggiornata; nessuna variabile nuova |
| Documenti | questa spec; README (sezione v2, screenshot); `CLAUDE.md`; `DESIGN.md` (card lista, griglia foto, mappa, campanella, meteo) |
| Trello | lista «v2 Social», una card per task del piano |
| Tag | `v2.0` |
| Stima | 4–5 giorni: liste 1, foto e mappa 1,5, notifiche 0,5, extra 1, chiusura 0,5. Checkpoint D-27 sabato 18 ottobre a v2 in corso |
