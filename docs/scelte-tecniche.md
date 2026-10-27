# SplitTrip — perché così

Le scelte tecniche in forma breve, per le domande della presentazione del 28 ottobre 2026. Ogni riga ha la risposta da dire a voce e il riferimento al registro `docs/decisioni.md` (D-xx), dove c'è il resto: data, alternative, motivo, reversibilità. ★ = domanda probabile. «A lezione» = cosa si usava nel corso (syllabus Epicode, settimane 1–21).

**La regola seguita:** dove la lezione mostrava uno strumento l'ho usato se era il più adatto; dove ne ho scelto un altro è perché il contesto era diverso (una persona, due settimane, un server gratuito da 256 MB, un'app da telefono per un gruppo di amici). Ogni «non fatto» ha un costo stimato in `docs/ROADMAP.md`.

---

## 0. Rispetto al programma del corso

| Sett. | A lezione | In SplitTrip |
|---|---|---|
| 1–5, 7 | HTML, CSS, Flexbox, OOP, REST, `fetch` | ✅ uguale |
| 6 | **Bootstrap + SASS** | ⚠️ CSS puro con variabili (token) |
| 9–11 | React con **CRA**, test con **Jest**, **Redux + thunk**, TypeScript | ⚠️ **Vite**, **Vitest**, **TanStack Query**; TypeScript ovunque |
| 13–14 | Java, Spring Boot, Postgres, Docker, JWT, workflow **BMAD** | ✅ uguale; ⚠️ workflow Superpowers (spec → piano → TDD) |
| 15 | JPA, **paginazione**, errori centralizzati, **export Excel/Word** | ✅ JPA e Problem Details; ⚠️ niente paginazione delle spese; ❌ niente export |
| 16 | upload **foto/video** su servizio esterno, test | ✅ foto nel database, Testcontainers; ❌ niente video |
| 18 | **Google Maps**, WebSocket, **OCR**, **RAG** | ⚠️ Leaflet + OpenStreetMap; ✅ WebSocket STOMP; ❌ niente OCR né RAG |
| 19 | **chat privata**, **email automatiche**, API Claude, **Redis**, asincrono, agenti | ⚠️ chat di gruppo; ⚠️ email solo per la password; ✅ Claude Haiku; ⚠️ cache in memoria; ✅ eventi dopo il commit; ❌ niente agenti |
| 20 | **2FA**, SQLi/XSS, **GDPR e oblio**, deploy PaaS, Swagger | ❌ niente 2FA; ✅ SQLi/XSS; ⚠️ GDPR senza «Elimina account»; ✅ Render, Swagger |

---

## 1. Prodotto e metodo

| Domanda | Risposta | Rif. |
|---|---|---|
| ★ Perché un'altra app, se c'è Tricount? | «Tricount divide i conti, SplitTrip si occupa del viaggio»: liste, foto sulla mappa, meteo, chat, consigli, divisione per notti di presenza, offline in lettura, valute, partecipanti senza account | D-28, D-31, D-69 |
| ★ Perché non BMAD, come a lezione? | stesso scopo (progettare prima di scrivere codice), meno cerimonia: brainstorming → spec approvata → piano → **TDD**, più la revisione finale di ogni versione da un contesto fresco, che ha trovato errori veri. 76 decisioni registrate con le alternative scartate | D-20 |
| Perché commit su `main` senza PR? | una persona sola: la PR non ha revisori. La qualità la fanno test e CI a ogni push | D-23, D-66 |
| ★ Si usa senza account? | **Essere nel viaggio** sì: chi organizza aggiunge «Luca» per nome e Luca entra nei conti. **Usare l'app** no: deve sapere chi paga, chi scrive, chi carica. L'ospite via link è in roadmap: il link diventerebbe una credenziale | D-02, D-30, D-74 |
| Perché rilasci v1 → v3.6? | ogni versione presentabile da sola: se il tempo finiva, si tagliava l'ultima | D-01, D-27 |
| Perché mobile-first (430 px)? | in vacanza si usa il telefono | D-11 |

---

## 2. Architettura e stack

| Scelta | Al posto di | Perché | Rif. |
|---|---|---|---|
| Spring Boot 4.1, Java 25, Postgres, Flyway | come a lezione (`ddl-auto=update` → Flyway) | schema versionato, `NUMERIC` per i soldi, `validate` soltanto | D-09 |
| ★ **Vite** | CRA | CRA non è più mantenuto né consigliato da React; Vite parte in un secondo e ha il plugin PWA. Il codice React è identico | D-19 |
| **Vitest** | Jest | runner nativo di Vite, stessa configurazione, API compatibile; 387 test in meno di un minuto | D-19 |
| ★ **CSS con token** | Bootstrap + SASS | sistema visivo nostro (colori per ruolo, tema scuro, stagioni, accessibilità) in un file; Bootstrap porta il suo aspetto e il suo peso; variabili e nesting sono già nel CSS | D-57, D-58 |
| ★ **TanStack Query** | Redux + thunk | quasi tutto è stato del server: cache, ricarico, attesa ed errore già gestiti, più persistenza offline e rilettura delle pagine dei soldi gratis. Lo stato del client è piccolo (contesto React) | D-19, D-63 |
| ★ **Monolite** a package | microservizi | una persona, un server gratuito; i moduli parlano per eventi interni | D-12 |
| Home in **una chiamata** | una per viaggio | dieci viaggi farebbero trenta richieste a un server gratuito | D-49 |
| `fetch`, React Hook Form + Zod, Render | axios, moduli a mano | niente dipendenze per ciò che il browser fa già; validazione dichiarata una volta | D-08, D-19 |

Docker: database locale e di e2e, Testcontainers nei test, immagine del backend su Render.

---

## 3. Soldi

| Domanda | Risposta | Rif. |
|---|---|---|
| ★ `BigDecimal` e non `double`? | `0.1 + 0.2` fa `0.30000000000000004`; scala 2, HALF_UP, `NUMERIC` | CLAUDE.md |
| 10 € diviso 3? | 3,34 + 3,33 + 3,33: il resto ai primi in ordine fisso, uguale nel server e nell'anteprima | `EqualSplitter` |
| ★ I rimborsi sono il minimo? | greedy: il debitore più grande paga il creditore più grande; al massimo n − 1. Il minimo assoluto è NP-difficile; per amici basta | D-14 |
| Saldi non salvati? | calcolati ogni volta dalle spese: una sola fonte di verità, classe pura testabile | D-13 |
| Spese sui partecipanti, non sugli utenti? | c'è sempre chi non scarica l'app; chi esce ha `left_at`, mai cancellato | D-30 |
| Cestino solo per spese e rimborsi? | i soldi meritano storico; foto e voci sono usa e getta | D-15 |
| «Conta per»? | tolto il giorno della consegna: difficile da capire dal telefono; il motore dei pesi resta per le spese vecchie | D-75 |
| ★ Spese non paginate? | decine per viaggio, pochi KB; paginare complica saldi e offline. La chat sì, a blocchi | D-49 |
| ★ Valute? | si scrive lo scontrino nella sua valuta; cambio BCE (Frankfurter, dal server, con cache) **salvato con la spesa** e mai ricalcolato; i saldi leggono solo il convertito | D-69 |
| Lo yen senza virgola? | elenco delle valute senza centesimi condiviso da server e browser | D-70 |

---

## 4. Mappe, luoghi, meteo, foto

| Domanda | Risposta | Rif. |
|---|---|---|
| ★ Perché non Google Maps? | chiave API con carta di credito, script che traccia, più domini nella CSP. Leaflet + OpenStreetMap: gratuito, senza chiave, dati aperti; si perdono Street View e schede, che non servono | D-10 |
| Ricerca luoghi dal server? | al servizio va solo il testo, con cache e 30 ricerche al minuto; CSP invariata. Open-Meteo al posto di Photon: 0,1 s contro 8–11 e italiano | D-46, D-51 |
| ★ Meteo dal browser? | il limite gratuito di Open-Meteo (10.000 al giorno) è per IP e Render fa uscire tutti i suoi siti dagli stessi IP: bloccato da venerdì (`429`). Dal browser ogni persona usa il proprio IP; lo dice l'informativa. Home e AI ancora dal server: riserva in roadmap | D-76 |
| Destinazione dall'elenco? | senza coordinate niente meteo, mappa, stagione; servizio giù = 503, non un dato a metà | D-60 |
| ★ Foto nel database, non Cloudinary? | il disco gratuito di Render si cancella al riavvio; zero servizi e chiavi in più. Non scala: object storage (R2) in `costi-operativi.md` | D-07 |
| Il server riscrive le immagini? | via EXIF e GPS (posizione solo col consenso); rifiuta oltre 50 MP leggendo l'intestazione; miniatura lato server | D-35, D-38 |
| Niente video? | cento volte una foto, server da 256 MB: fuori scala e fuori centro | — |

---

## 5. Sicurezza e account

| Domanda | Risposta | Rif. |
|---|---|---|
| JWT, non sessioni? | API senza stato; libreria già in Spring Security | D-02, D-21 |
| CSRF disabilitato? | niente cookie: un sito terzo non può aggiungere l'intestazione; CORS solo sul nostro frontend | D-17 |
| ★ Niente 2FA? | app tra amici, non una banca; un ostacolo a ogni accesso in vacanza. C'è bcrypt, rate limiting, token 24 h, reset monouso, CSP, controllo di appartenenza a ogni richiesta. TOTP: circa un giorno | D-18, D-22, D-61 |
| Refresh token? | no: un token rubato vale fino a 24 ore, miglioria nota | D-18 |
| SQLi e XSS? | come a lezione: JPA con parametri, escape di React, CSP; mai stack trace, id utente solo dal token, immagini riscritte | D-29 |
| ★ Email solo per la password? | tra amici l'invito va su WhatsApp o col QR. Il reset: link 30 minuti monouso, solo hash nel DB, risposta identica, Brevo via API **dopo il commit** (SMTP spesso bloccato) | D-05, D-61, D-67 |
| Login a raffica? | rate limiter a finestra scorrevole in 40 righe, IP vero da `CF-Connecting-IP`; vale per un'istanza | D-22 |
| Chi ha il codice entra? | fiducia tra amici; link per persona ≈ un giorno | D-32, D-67 |

---

## 6. Tempo reale, cache, offline, AI

| Domanda | Risposta | Rif. |
|---|---|---|
| ★ WebSocket STOMP, ma si scrive via REST? | il socket solo **spinge** dopo il commit: mai un messaggio non salvato, sicurezza una volta sola; token nel CONNECT, mai nell'URL | D-39 |
| Chat di gruppo, non privata? | il soggetto è il viaggio; per l'uno-a-uno c'è WhatsApp. In più reazioni, «sta scrivendo», righe-evento, non letti | D-40, D-47 |
| Notifiche e asincrono? | eventi `AFTER_COMMIT` scrivono la notifica e alimentano il socket; nessuna coda perché nulla dura più di millisecondi | D-36 |
| Cache in memoria, non Redis? | un'istanza, zero servizi; con più istanze Redis, interfacce già isolate | D-22, D-37 |
| Push sul telefono? | roadmap: chiavi VAPID, 1–2 giorni | ROADMAP 8 |
| ★ PWA, non nativa? | un codice per tutti, senza store e commissioni | D-63 |
| ★ Offline solo in lettura? | scritture in coda = spese doppie e conflitti; per i soldi meglio un «non ora». Cache: guscio, font, foto; dati in IndexedDB per utente; tutto cancellato all'uscita | D-63 |
| ★ Cosa fa l'AI e cosa riceve? | consigli e valigia; solo destinazione, date, persone, meteo, voci in lista: **mai nomi, email, importi**. Haiku, 5 al giorno per viaggio, chiave solo su Render | D-41 |
| ★ Niente OCR? | un OCR sbagliato sbaglia i saldi: serve verifica riga per riga, progetto a sé (roadmap 6). Oggi lo scontrino resta allegato come prova | D-37 |
| Niente RAG né agenti? | nessun corpus da interrogare; pochi dati strutturati nel prompt; un agente che agisce sui soldi del gruppo non lo vuole nessuno | D-41 |

---

## 7. Interfaccia, accessibilità, linguaggio, GDPR

| Domanda | Risposta | Rif. |
|---|---|---|
| Lampone solo per «devi dare»? | un colore con un solo significato, mai decorazione, sempre con testo e segno | D-58, D-24 |
| Sfondo con le stagioni? | racconta il viaggio; i colori dei soldi restano fissi | D-58 |
| Motion, Canvas, emoji nostre? | quattro animazioni con uno scopo, «riduci movimento» rispettato; immagine per le storie disegnata nel browser; 6 reazioni + 40 emoji senza librerie | D-43, D-56, D-47 |
| Classifiche mai sui soldi, ruota non pesata? | nessun imbarazzo per chi spende meno; la ruota è un gioco | D-55, D-52 |
| ★ Accessibilità? | axe in ogni pagina (0 violazioni), verifica a mano (tastiera, lettore di schermo, zoom, daltonismo), impostazioni del telefono rispettate; mai solo il colore | D-24, D-65 |
| Linguaggio senza genere, senza schwa? | si riformula («chi organizza»); schwa e asterischi non si leggono bene; un test blocca le forme col genere | D-64 |
| ★ GDPR: cosa manca? | ci sono termini, informativa, consenso salvato, niente cookie, dati minimi all'AI, EXIF tolti. Manca «Elimina account»: i partecipanti non si cancellano (D-30), quindi serve **anonimizzare**, da progettare (roadmap 9). Contatto di esempio dichiarato | D-72, D-73 |

---

## 8. Qualità

| Domanda | Risposta | Rif. |
|---|---|---|
| ★ Come sai che funziona? | 259 test backend (JUnit, MockMvc, **Testcontainers** con Postgres vero), 387 frontend (Vitest, Testing Library, MSW, axe), 1 giro e2e Playwright (registrazione → QR → cena → saldo → spesa in yen). TDD. CI su GitHub Actions a ogni push: alla prima esecuzione due errori sui soldi | D-20, D-66 |
| Testcontainers, non H2? | H2 non è Postgres: migrazioni, `NUMERIC` e vincoli si provano sul database vero | — |
| Un solo e2e? | lento e fragile: uno sul giro che conta; il resto lo coprono i test veloci | D-66 |
| Analisi statica? | ESLint, `tsc` nella build, warning del compilatore, regole in CLAUDE.md controllate alla revisione di ogni versione | — |

---

## 9. Limiti noti (dirli prima)

| Limite | Soluzione | Costo |
|---|---|---|
| Server che dorme dopo 15 min; DB gratuito che scade a novembre | piani Starter e Basic di Render | 7 + 6 $/mese |
| Cache, rate limiter, WebSocket in memoria | Redis e broker, se servono più istanze | — |
| Foto nel database | object storage (R2) | centesimi |
| Greedy non sempre minimo; token valido 24 h; niente 2FA; niente «Elimina account»; codice invito condiviso | n − 1 basta; refresh token; TOTP; anonimizzazione; link per persona | ~1 giorno l'uno |
| Niente export Excel/Word; niente OCR | CSV dal browser (2 h); modello vision con verifica (giorni) | — |
| Open-Meteo gratuito solo non commerciale; Home e AI senza meteo quando l'IP di Render è bloccato | licenza (29 $/mese); ultima previsione salvata (roadmap 18) | — |

Costi e modello di business: `docs/costi-operativi.md`. Migliorie: `docs/ROADMAP.md`.
