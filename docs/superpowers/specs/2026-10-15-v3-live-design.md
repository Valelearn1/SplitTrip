# SplitTrip — Design v3 «Live»

**Data:** 15 ottobre 2026 · **Stato:** approvato (brainstorming) · **Spec di riferimento:** `2026-10-12-splittrip-design.md` (v1, §2, §3 e §4/§6 «v3»), `2026-10-14-v1.5-divisioni-smart-design.md` (partecipanti), `2026-10-14-v2-social-design.md` (eventi interni e notifiche)

> Durante il viaggio il gruppo parla, decide e paga insieme. La v3 porta la conversazione dentro l'app, accanto ai conti: un messaggio scritto dal telefono compare subito sul PC, la cena appena aggiunta appare in chat e la campanella si accende senza ricaricare.

---

## 1. Obiettivi e limiti

### Cosa entra

| Funzione | Origine |
|---|---|
| **Chat di gruppo** per viaggio in tempo reale, con storico, righe automatiche degli eventi del viaggio, contatore dei non letti, «sta scrivendo…», eliminazione dei propri messaggi | spec v1 §2, §4, §6; D-39, D-40 |
| **Notifiche live**: la campanella si aggiorna appena nasce la notifica; il polling di 60 s resta come riserva | spec v1 §3; D-36, D-39 |
| **Consigli AI**: card «Consigli per …» nella panoramica e «Suggerisci voci» nella lista Valigia | extra D-25; D-41 |
| **Movimento** con Motion: busta che si apre leggendo una notifica, valigia che si chiude a lista completata e che saltella al risveglio del server, messaggi che entrano in chat | D-43 |

### Cosa resta fuori

Messaggi privati uno a uno, allegati e foto in chat, reazioni e risposte citate, modifica dei messaggi, conferme di lettura per persona, notifiche push del browser, più istanze del backend (broker esterno), assistente AI che risponde in chat, AI su spese o saldi.

### Successo

- Vale scrive «Ci vediamo alle 20 al ristorante» dal telefono: Marco lo vede sul PC in meno di un secondo, senza ricaricare.
- Giulia aggiunge «Cena · 45,00 €»: in chat compare la riga con il link alla spesa, e la campanella di Vale e Marco passa a «1» subito.
- Render si addormenta e si risveglia: l'app si ricollega da sola e recupera quello che è arrivato nel frattempo.
- Per Lisbona dal 1° al 6 novembre, «Suggerisci voci» propone ombrello e adattatore; si aggiungono solo quelle spuntate.
- Con `prefers-reduced-motion` attivo non si muove niente, e ogni informazione resta leggibile in testo.
- Un viaggio di v2 funziona identico, con la chat vuota.

---

## 2. Decisioni di design

| ID | Decisione | Alternative scartate | Motivo |
|---|---|---|---|
| D-39 | **WebSocket + STOMP** (Spring, broker in memoria; `@stomp/stompjs` nel FE). **Si scrive via REST, si riceve via WebSocket**: invio, eliminazione e «letto» sono endpoint REST; il socket spinge soltanto, dopo il commit. Unica eccezione: «sta scrivendo», effimero, inviato su STOMP | Server-Sent Events + REST; WebSocket con protocollo nostro; inviare i messaggi su STOMP | è già nella spec v1 §6 ed è il requisito del corso; scrivere via REST riusa validazione, Problem Details, `requireMember` e i test esistenti; un'istanza sola su Render non ha bisogno di un broker esterno |
| D-40 | **Chat**: l'autore è un **partecipante** (D-30), scrive solo chi ha un account; un messaggio eliminato perde davvero il testo e resta come «Messaggio eliminato» (eccezione dichiarata alla regola «soft delete solo per spese e rimborsi»: qui serve a cancellare il contenuto, non a ripristinarlo); le **righe evento** sono una fotografia del testo al momento dell'evento; non letti con `participants.chat_read_at` | autore = utente; cancellazione fisica senza traccia; soft delete ripristinabile; righe evento ricalcolate dalla spesa | il nome nel viaggio è quello del partecipante; «Messaggio eliminato» non lascia buchi nella conversazione; la fotografia non si rompe se la spesa cambia o sparisce |
| D-41 | **Consigli AI** con l'API di Anthropic (`claude-haiku-4-5`, configurabile), chiave `ANTHROPIC_API_KEY` solo su Render; al modello vanno solo destinazione, date, notti, numero di persone, meteo e voci già in valigia; risposta solo JSON validato; **5 generazioni al giorno per viaggio**; le voci proposte non si salvano finché non le spunti; etichetta «Generato con AI · può contenere errori» | assistente in chat; modello più grande; nessun limite; inviare nomi e spese | utile e concreto (si lega a liste e meteo della v2), costo di pochi centesimi per la demo, nessun dato personale lascia il server, il risultato non può fare danni |
| D-42 | **Chat nell'intestazione del viaggio**: bottone fumetto 44 px con il numero dei non letti accanto all'ingranaggio; la barra resta a cinque voci (aggiorna D-26/D-37) | sesta voce nella barra; Chat e «Altro» al posto di Liste e Foto | a 390 px sei voci stringono troppo le etichette; la chat è a un tocco da ogni pagina del viaggio, come la campanella |
| D-43 | **Movimento con Motion** (`motion`, import da `motion/react`): animazioni con uno scopo in quattro punti (busta, valigia due volte, messaggi in arrivo), 200–600 ms, `MotionConfig reducedMotion="user"` all'avvio dell'app; aggiorna la regola di `DESIGN.md` «nessuna animazione d'ingresso» | solo CSS + SVG; Lottie; nessuna animazione | Motion gestisce ingresso e uscita degli elementi React e rispetta da solo la preferenza di movimento ridotto; le illustrazioni restano SVG nostri, senza file esterni né licenze |

---

## 3. Modello dati — migrazione `V5__live.sql`

### `chat_messages`

| Colonna | Tipo | Note |
|---|---|---|
| `id` | uuid PK | |
| `trip_id` | uuid → trips | `ON DELETE CASCADE` |
| `author_participant_id` | uuid → participants, null | `DEFERRABLE INITIALLY DEFERRED` (lezione della V3: ordine dei cascade alla cancellazione del viaggio); null per le righe evento |
| `kind` | varchar(10) | `TEXT` / `EVENT` |
| `content` | varchar(1000), null | null solo se eliminato |
| `event_type` | varchar(30), null | `EXPENSE_CREATED` / `SETTLEMENT_CREATED` / `PARTICIPANT_JOINED` |
| `ref_id` | uuid, null | id della spesa per `EXPENSE_CREATED`; nessuna FK (la spesa può finire nel cestino) |
| `created_at` | timestamptz | |
| `deleted_at` | timestamptz, null | |

Vincoli:
- `chat_kind`: `TEXT` → autore non null e `event_type` null; `EVENT` → autore null, `event_type` non null, `content` non null, `deleted_at` null.
- `chat_content`: se `deleted_at` è null, `content` ha da 1 a 1000 caratteri; se `deleted_at` non è null, `content` è null.

Indice: `(trip_id, created_at DESC, id DESC)` per lo storico paginato.

### `participants`

`chat_read_at timestamptz null`: fin dove il partecipante ha letto; null = mai aperta (tutti i messaggi sono non letti, escluse le proprie righe).

### `ai_suggestions`

| Colonna | Tipo | Note |
|---|---|---|
| `id` | uuid PK | |
| `trip_id` | uuid → trips | `ON DELETE CASCADE` |
| `kind` | varchar(10) | `TIPS` / `PACKING` |
| `content` | text | JSON già validato |
| `created_at` | timestamptz | |

Serve a due cose: mostrare gli ultimi consigli senza rigenerarli e contare le generazioni del giorno (fuso `Europe/Rome`).

---

## 4. Backend

### Package

| Package | Contenuto |
|---|---|
| `live` | `WebSocketConfig` (endpoint `/ws`, broker `/topic` e `/queue`, prefisso `/app`, prefisso utente `/user`, heartbeat 10 s, frame in entrata ≤ 8 KB), `StompAuthInterceptor` (CONNECT, SUBSCRIBE, SEND), `LivePublisher` (`toTrip(tripId, envelope)`, `toUser(userId, payload)`), `TypingController` (`@MessageMapping`) |
| `chat` | `ChatMessage`, `ChatMessageKind`, `ChatMessageRepository`, `ChatService`, `ChatController`, `ChatEventListener`, `dto/*` |
| `ai` | `AiClient` (interfaccia), `AnthropicAiClient`, `DisabledAiClient`, `AiConfig`, `AiService`, `AiController`, `AiSuggestion`, `dto/*` |
| `notification` (v2) | `NotificationListener`, dopo aver salvato, chiama `LivePublisher.toUser` |
| `common/events` (v2) | `ExpenseCreated` riceve anche `amount` e `currency` |

### Eventi (spec v1 §3, D-36)

`ChatEventListener` ascolta `ExpenseCreated`, `SettlementCreated`, `ParticipantJoined` con `@TransactionalEventListener(AFTER_COMMIT)` + `REQUIRES_NEW` (come le notifiche), salva la riga `EVENT` e la spinge sul canale del viaggio. Testi (in `ChatMessages`, classe pura; importi formattati come nelle notifiche, con la valuta della spesa):

| Evento | Testo |
|---|---|
| `EXPENSE_CREATED` | «Giulia ha aggiunto «Cena» · 45,00 €» |
| `SETTLEMENT_CREATED` | «Marco ha registrato un rimborso: Marco → Vale · 20,00 €» |
| `PARTICIPANT_JOINED` | «Nonna Pina ora fa parte del viaggio» |

`ChatService.send` e `delete` spingono `message.created` / `message.deleted` sullo stesso canale dopo il commit.

### API REST

| Metodo | Path | Note |
|---|---|---|
| GET | `/api/trips/{id}/messages?before=&size=` | più recenti per primi; `before` = id dell'ultimo messaggio ricevuto; `size` 1–50, default 30; restituisce anche `hasMore` |
| POST | `/api/trips/{id}/messages` | `{ content }`, 1–1000 caratteri dopo `strip()`; 201 con il messaggio |
| DELETE | `/api/trips/{id}/messages/{messageId}` | solo l'autore; 204; testo cancellato, `deleted_at` impostato |
| GET | `/api/trips/{id}/messages/unread-count` | `{ count }`, esclusi i propri messaggi e quelli eliminati |
| POST | `/api/trips/{id}/messages/read` | `chat_read_at = now()`; 204 |
| GET | `/api/trips/{id}/ai/tips` | `{ available, remainingToday, tips, generatedAt }` |
| POST | `/api/trips/{id}/ai/tips` | genera e salva 3–5 consigli |
| POST | `/api/trips/{id}/todo-lists/{listId}/ai/suggestions` | 8–12 voci proposte, non salvate; solo liste `PACKING` |

`MessageResponse`: `id`, `kind`, `authorParticipantId`, `authorName`, `authorUserId`, `authorHasAvatar`, `content`, `eventType`, `refId`, `createdAt`, `deleted`.

### Canali STOMP

| Canale | Direzione | Contenuto |
|---|---|---|
| `/ws` | handshake | WebSocket nativo, senza SockJS; origine ammessa `CORS_ORIGIN` |
| `/topic/trips/{id}` | server → membri | busta `{ type, data }`: `message.created` (`MessageResponse`), `message.deleted` (`{ id }`), `typing` (`{ participantId, name }`) |
| `/user/queue/notifications` | server → una persona | `{ notification, unreadCount }` |
| `/app/trips/{id}/typing` | client → server | corpo vuoto; il server rimanda `typing` a tutto il canale del viaggio; il FE ignora il proprio |

### Autorizzazione (`StompAuthInterceptor`)

| Frame | Regola |
|---|---|
| Handshake HTTP `/ws` | `permitAll` in `SecurityConfig`: il browser non può mettere header sull'upgrade |
| `CONNECT` | header nativo `Authorization: Bearer <jwt>` validato con il `JwtDecoder` delle API; il `Principal` della sessione ha come nome lo `userId`; assente o non valido → `MessageDeliveryException`, frame ERROR, connessione chiusa |
| `SUBSCRIBE` | `/topic/trips/{id}` solo se l'utente è partecipante attivo; `/user/queue/notifications` sempre; ogni altra destinazione rifiutata |
| `SEND` | solo `/app/trips/{id}/typing`, solo da membri, al massimo uno ogni 2 s per utente e viaggio (gli altri si scartano senza errore) |
| Limite noto | chi lascia il viaggio a connessione aperta continua a ricevere fino alla riconnessione; non può scrivere (REST lo blocca) |

### Limiti

- Chat: 20 messaggi al minuto per utente, finestra scorrevole in memoria → 429.
- Viaggio `CLOSED`: invio, eliminazione e generazione AI → 409; lettura e «letto» restano possibili.

### AI (`AiService`)

| Passo | Dettaglio |
|---|---|
| Accesso | `requireMember`; generare richiede viaggio non chiuso |
| Limite | 5 generazioni (TIPS + PACKING) per viaggio nel giorno corrente → 429 «Hai usato le 5 generazioni di oggi» |
| Input | system prompt fisso in italiano; nel messaggio utente, tra delimitatori `<viaggio>…</viaggio>`, solo: destinazione, date, notti, numero di partecipanti attivi, meteo dal `WeatherService` (se c'è), voci già nella lista (per PACKING); mai nomi, email, importi |
| Output | JSON richiesto nel prompt; parsing con Jackson; TIPS: 3–5 `{ title ≤ 60, text ≤ 280, category SEE/EAT/PACK/TIP }`; PACKING: 8–12 `{ text ≤ 80 }`; elementi fuori dai limiti scartati, voci già presenti tolte (confronto senza maiuscole e spazi); meno del minimo valido → errore |
| Errori | chiave assente → `available: false` sul GET, 503 sul POST; timeout (15 s), errore HTTP o JSON non valido → 503 «Consigli non disponibili, riprova tra poco»; la generazione fallita non consuma il limite |
| Client | `AnthropicAiClient` con `RestClient`: `POST https://api.anthropic.com/v1/messages`, header `x-api-key`, `anthropic-version: 2023-06-01`, `max_tokens` 1024; il testo è `content[0].text`; la chiave non compare mai nei log |
| Config | `app.ai.api-key=${ANTHROPIC_API_KEY:}`, `app.ai.model=claude-haiku-4-5`; chiave vuota → bean `DisabledAiClient` |

---

## 5. Frontend

### Librerie nuove

| Libreria | Uso |
|---|---|
| `@stomp/stompjs` | client STOMP su WebSocket nativo |
| `motion` | animazioni (D-43) |

### Collegamento live (`shared/live/`)

- `LiveProvider`: un solo `Client` STOMP per utente loggato, creato dopo il login e disattivato al logout; URL da `VITE_WS_URL` (default: stesso host di `/api` con `ws(s)://…/ws`); `connectHeaders` con il token; `reconnectDelay` 5 s, raddoppiato fino a 60 s; heartbeat 10 s.
- `useLiveStatus()`: `connected` / `connecting` / `offline`.
- `useTripChannel(tripId, onEvent)` e `useNotificationsChannel(onEvent)`: sottoscrivono e disiscrivono con il ciclo di vita del componente; se il server rifiuta la sottoscrizione a un viaggio, non la ritentano.
- A ogni riconnessione: `invalidateQueries` di messaggi, non letti e notifiche.
- Integrazione con TanStack Query: `message.created` inserisce nella cache dei messaggi deduplicando per `id`; `message.deleted` aggiorna il messaggio; la notifica aggiorna lista e contatore.
- Polling della campanella (v2) attivo solo quando lo stato non è `connected`.

### Navigazione (D-42)

Bottone Chat nell'intestazione del viaggio, prima dell'ingranaggio: icona `chat_bubble` 24 px, cerchio 44 px, pillola `coral` con il numero dei non letti, `aria-label` «Chat, 3 messaggi non letti» / «Chat». Rotta `/trips/:id/chat`, caricata in modo lazy come Foto.

### Pagina Chat

| Elemento | Comportamento |
|---|---|
| Messaggi | propri a destra su `teal-tint`, altrui a sinistra con avatar e nome; messaggi consecutivi dello stesso autore entro 5 minuti raggruppati (nome e avatar solo sul primo); orario `HH:mm` |
| Separatori di giorno | «Oggi», «Ieri», «lun 3 nov» |
| Righe evento | centrate, 0.875rem `ink-2`, icona della categoria; per le spese, link alla spesa |
| Eliminato | «Messaggio eliminato», corsivo `muted`; i propri messaggi hanno un bottone «Elimina» (icona con `aria-label`) con conferma in `Modal` |
| Campo | in fondo, sopra la tab bar su mobile; `textarea` che cresce fino a 4 righe; contatore da 900 caratteri in su; bottone «Invia» 48 px; su desktop Invio invia, Maiusc+Invio va a capo |
| Storico | caricato scorrendo verso l'alto (sentinella `IntersectionObserver`) e con il bottone «Messaggi precedenti»; la posizione di lettura resta ferma |
| Arrivi | se sei in fondo la pagina scorre; altrimenti pillola «Nuovi messaggi ↓» |
| «Sta scrivendo» | «Marco sta scrivendo…» sotto l'elenco, sparisce dopo 4 s senza segnali; il client invia `typing` al massimo ogni 2 s mentre si digita |
| Letti | all'apertura e a ogni messaggio ricevuto mentre la pagina è visibile: `POST …/read` |
| Stati | banner ambra «Riconnessione…» se non `connected`; a viaggio chiuso il campo diventa «Il viaggio è chiuso: la chat è in sola lettura» |

### Consigli AI

| Dove | Cosa |
|---|---|
| Panoramica | card «Consigli per {destinazione}» (nascosta se `available` è false): 3–5 righe con icona per categoria (`photo_camera`, `restaurant`, `luggage`, `lightbulb`) e la categoria anche in testo; «Genera consigli» / «Rigenera (4 rimaste oggi)»; durante la generazione righe-segnaposto e «Sto pensando…» (`role="status"`); nota «Generato con AI · può contenere errori» |
| Lista Valigia | bottone «Suggerisci voci» (icona `auto_awesome`) nelle sole liste `PACKING` aperte; `Modal` con le proposte già spuntate; «Aggiungi N voci» crea le voci con l'endpoint esistente, una per volta |

### Movimento (D-43)

| Momento | Animazione | Durata |
|---|---|---|
| Notifica letta | nella pagina Notifiche ogni riga ha una **busta** SVG: chiusa se non letta; al tocco il lembo si apre (rotazione sull'asse X) e poi si apre la destinazione; «Segna tutte come lette» le apre a cascata (40 ms l'una) | 250 ms |
| Lista Valigia completata | l'icona valigia della card si **chiude** e compare una spunta quando l'ultima voce viene spuntata | 500 ms |
| Risveglio del server | al posto dello spinner nel banner «Il server si sta svegliando…» la **valigia saltella** | ciclo 1,2 s |
| Messaggio in arrivo | i messaggi nuovi entrano con dissolvenza e scivolata di 8 px (solo quelli live, non lo storico) | 200 ms |

- Illustrazioni: SVG nostri in `shared/ui/illustrations/` (busta, valigia), con colori dai token.
- `MotionConfig reducedMotion="user"` in `main.tsx`: con movimento ridotto le trasformazioni si azzerano e restano solo gli stati finali.
- Nessuna informazione affidata al movimento: «non letta», «fatta» e lo stato del server restano scritti.

### Accessibilità (D-24)

- Elenco messaggi con `role="log"` e `aria-label` «Messaggi»: i nuovi vengono annunciati con cortesia, senza interrompere; «sta scrivendo» fuori dalla regione live.
- Ogni messaggio dice chi scrive in testo (anche i propri: «Tu»), mai solo con posizione o colore.
- Target 44 px, focus visibile, campo con etichetta «Scrivi un messaggio» (visivamente nascosta).
- Spec v1 §12.6: notifiche sempre visive, mai sonore.

### CSP (`render.yaml`)

`connect-src 'self' https://splittrip-api.onrender.com wss://splittrip-api.onrender.com`.

---

## 6. Sicurezza e privacy

| Rischio | Difesa |
|---|---|
| Accesso alla chat altrui | `requireMember` su ogni endpoint; controllo su ogni `SUBSCRIBE`; query sempre filtrate per `tripId` |
| Token nei log | JWT nel frame CONNECT, mai nell'URL del WebSocket |
| Cross-site WebSocket hijacking | origini ammesse = `CORS_ORIGIN`; senza token nel CONNECT la connessione non serve a nulla |
| XSS nei messaggi | testo mostrato da React (escape automatico), nessun HTML né markdown; lunghezza massima lato server |
| Spam e consumo | 20 messaggi/min per utente; frame ≤ 8 KB; `typing` limitato; AI 5 al giorno per viaggio |
| Prompt injection | dati utente tra delimitatori; output solo JSON validato e mostrato come testo; nessuna azione automatica |
| Dati verso Anthropic | nessun nome, email o importo; in README la riga «AI» nella sezione Sicurezza |
| Chiave API | solo variabile d'ambiente su Render; mai loggata né esposta al frontend |
| Messaggi eliminati | testo cancellato dal database, non solo nascosto |

---

## 7. Test

| Livello | Test |
|---|---|
| Migrazione | `MigrationV5Test`: eliminare un viaggio con messaggi, eventi e consigli AI; vincoli `chat_kind` e `chat_content` |
| Pura | `ChatMessagesTest` (testi degli eventi, importi in italiano); parsing e validazione JSON dell'AI |
| Chat | `ChatControllerTest`: invio, storico con `before` e `hasMore`, eliminazione (testo null nel DB), 400 su vuoto e 1001 caratteri, 403 non membro, 403 messaggio altrui, 409 viaggio chiuso, 429 al 21° messaggio, non letti e «letto» |
| Eventi | `ChatEventListenerTest`: spesa creata → riga evento con fotografia e `ref_id`; transazione annullata → nessuna riga |
| Live | `LiveIntegrationTest` (`RANDOM_PORT`, `WebSocketStompClient` vero): CONNECT senza token o con token falso rifiutato; SUBSCRIBE a un viaggio altrui rifiutato; messaggio inviato via REST arriva sul canale; notifica arriva solo al destinatario; `typing` rimandato una sola volta entro 2 s |
| AI | `AiServiceTest` (client finto): testo per il modello senza nomi né email; JSON rotto → 503; elementi fuori limite scartati e doppioni tolti; 6ª generazione → 429; fallita → limite non consumato; senza chiave → `available: false`; viaggio chiuso → 409 |
| Client AI | `AnthropicAiClientTest` con `MockRestServiceServer`: URL, header, modello, lettura di `content[0].text` |
| FE live | client STOMP finto: sottoscrizione e disiscrizione, rifiuto senza nuovi tentativi, riconnessione che invalida le query, logout che disattiva il client, polling solo se offline |
| FE chat | propri e altrui, raggruppamento, riga evento con link, eliminato, invio, arrivo live, nessun doppione, sola lettura, «Nuovi messaggi» |
| FE AI | card nascosta senza chiave, generazione, limite raggiunto, finestra Valigia che aggiunge solo le voci spuntate |
| FE movimento | busta `data-state` da `closed` a `open` alla lettura; con movimento ridotto la navigazione avviene subito |

### Review Focus

1. **Sottoscrizione rifiutata**: in Spring un `SUBSCRIBE` rifiutato chiude l'intera connessione; il FE non deve entrare in un ciclo di riconnessioni.
2. **Doppioni**: il proprio messaggio arriva sia dalla risposta REST sia dal canale; deve comparire una volta.
3. **Logout**: dopo il logout il client non riceve più nulla, nemmeno su un telefono condiviso.
4. **Risveglio di Render a conversazione aperta**: dopo la riconnessione i messaggi arrivati nel frattempo compaiono, in ordine.
5. **Risposta AI malformata o manipolata**: JSON rotto, troppo lungo o con testo inatteso non rompe la pagina e non consuma il limite.

---

## 8. Consegna

| Passo | Dettaglio |
|---|---|
| Decisioni | D-39…D-43 in `decisioni.md`; nota su D-26/D-37 (navigazione) e sulla regola del movimento in `DESIGN.md` |
| Migrazione | `V5__live.sql` nel primo task backend; testata; applicata da Render al push |
| Render | CSP con `wss://`; variabile `ANTHROPIC_API_KEY` impostata dall'autrice sul servizio API |
| Documenti | questa spec; README (sezione v3, Sicurezza «Tempo reale» e «AI», screenshot chat); `CLAUDE.md` (package `live`, `chat`, `ai`; stato); `DESIGN.md` (chat, bottone chat, card consigli, movimento) |
| Trello | lista «v3 Live», una card per task del piano |
| Tag | `v3.0` |
| Stima | 4–5 giorni: live e chat backend 1,5, chat frontend 1, AI 1, movimento 0,5, chiusura 0,5. Checkpoint D-27 sabato 18 ottobre a v3 in corso |
