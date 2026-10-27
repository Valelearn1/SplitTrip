# SplitTrip — perché così

Le scelte logiche e tecniche spiegate come risposte alle domande che possono arrivare alla presentazione del 28 ottobre 2026, con un confronto puntuale con il programma del Master Full-Stack AI Developer (syllabus Epicode, settimane 1–21).

**Come si legge:** per ogni domanda c'è una **risposta da dire a voce** (una o due frasi), poi le **alternative scartate** e il **riferimento** al registro `docs/decisioni.md` (D-xx), dove ogni scelta ha data, motivo e reversibilità. Le domande più probabili sono segnate con ★. Dove SplitTrip fa una cosa **diversa da quella vista a lezione**, c'è la scritta «**A lezione:**» con quello che si usava nel corso.

---

## 0. Rispetto al programma del corso

Colpo d'occhio: cosa del programma è in SplitTrip, cosa è stato fatto in modo diverso e cosa no. I dettagli sono nelle sezioni indicate.

| Sett. | A lezione | In SplitTrip | Dove |
|---|---|---|---|
| 1–5 | HTML, CSS, Flexbox, animazioni CSS, UX/UI | ✅ uguale: layout in CSS puro, Flexbox e Grid, animazioni CSS per le piccole cose | §10 |
| 6 | **Bootstrap + SASS** | ⚠️ **diverso**: CSS puro con variabili (token) in un file, niente framework né preprocessore | §2.3 |
| 7 | OOP, JSON, API REST, `fetch` | ✅ uguale: client API con `fetch`, niente axios | §2 |
| 7, 13 | **Claude Code** | ✅ uguale, con un metodo esplicito: specifica → piano → test → codice, e un registro delle decisioni | §1 |
| 9 | React, **CRA** (Create React App) | ⚠️ **diverso**: React 19 con **Vite** | §2.1 |
| 10 | React Hooks, React Router, **React Testing** (Jest) | ✅ Hooks e Router uguali; ⚠️ test con **Vitest** invece di Jest | §2.2, §12 |
| 11 | **Redux + thunk**, TypeScript | ✅ TypeScript ovunque; ⚠️ **niente Redux**: TanStack Query | §2.4 |
| 13–14 | Java, Spring Boot, PostgreSQL, Docker, API REST, CORS, **JWT** | ✅ uguale (Spring Boot 4.1, Java 25, Postgres, Docker per il DB e per Render) | §2, §6 |
| 14 | workflow BMAD | ⚠️ **diverso**: workflow Superpowers (brainstorming → spec → piano → TDD), stesso scopo | §1 |
| 15 | JPA, **paginazione e filtri**, errori e validazione centralizzati, **export Excel/Word** | ✅ JPA ed errori centralizzati (Problem Details); ⚠️ **niente paginazione** (scelta motivata); ❌ **niente export Excel/Word** | §3.8, §13 |
| 16 | follow/unfollow, **upload foto/video**, clean code, test unitari e d'integrazione | ✅ foto (nel database, non su Cloudinary), test con Testcontainers; ❌ **niente video**; il «social graph» è il viaggio | §5, §12 |
| 18 | **mappe** (Google Maps), **WebSocket** per le notifiche, **OCR**, **RAG** | ⚠️ mappe con **Leaflet + OpenStreetMap**; ✅ WebSocket STOMP; ❌ **niente OCR né RAG** (scelte motivate) | §4, §7, §9 |
| 19 | **chat privata**, **email automatiche**, API Claude, **caching**, processi asincroni, agenti | ⚠️ chat **di gruppo** per viaggio; ⚠️ email **solo** per la password dimenticata; ✅ API Claude (Haiku) con dati minimi; ⚠️ cache **in memoria**, niente Redis; ✅ eventi dopo il commit; ❌ niente agenti | §7, §6.6, §9 |
| 20 | **2FA**, anti-SQLi, anti-XSS, **GDPR e diritto all'oblio**, deploy PaaS, Swagger | ❌ **niente 2FA** (motivato); ✅ SQLi e XSS; ⚠️ GDPR: termini, informativa, consenso salvato, **cancellazione account rimandata**; ✅ Render con log e health check; ✅ Swagger | §6, §11.3 |
| 21 | app full-stack integrata con l'AI | ✅ è il progetto | — |

**La regola che ho seguito:** dove la lezione mostrava uno strumento, l'ho usato se era il più adatto al problema; dove ne ho scelto un altro, è perché il contesto era diverso da quello dell'esercitazione (una persona, due settimane, un server gratuito da 256 MB, un'app da telefono per un gruppo di amici) e la scelta è registrata con il motivo. Niente è stato tolto per pigrizia: ogni «non fatto» ha un costo stimato nella roadmap.

---

## 1. Prodotto e metodo

### ★ Perché un'altra app, se esistono Splitwise e Tricount?
- **A voce:** «Tricount divide i conti, SplitTrip si occupa del viaggio.» Oltre alle spese ci sono quello che serve in vacanza (liste condivise, foto sulla mappa, meteo, chat, consigli) e una divisione che quelle app non fanno: per notti di presenza, per chi arriva dopo o parte prima.
- **In più:** funziona offline in sola lettura, le spese si scrivono nella valuta dello scontrino, e chi non ha l'account partecipa lo stesso ai conti.
- **Riferimento:** `docs/ROADMAP.md`, D-28, D-31, D-69.

### Perché rilasci incrementali (v1 → v3.6)?
- **A voce:** ogni versione era presentabile da sola. Se il tempo finiva, si tagliava l'ultima, non metà di tutto.
- **Scartato:** un'unica release alla fine.
- **Riferimento:** D-01, D-27.

### ★ Come hai lavorato con Claude Code? Perché non il workflow BMAD visto a lezione?
- **A voce:** con un metodo in quattro passi: **brainstorming** (domande una alla volta finché il problema è chiaro), **specifica** scritta e approvata, **piano** a compiti piccoli, poi **codice partendo dai test**. Ogni scelta va nel registro con le alternative scartate: sono 75 decisioni. I commit li ho fatti io, uno per compito.
- **A lezione:** il workflow BMAD (ruoli di agente: analista, architetto, sviluppatore, con documenti per ciascuno).
- **Perché diverso:** lo scopo è lo stesso, progettare prima di scrivere codice e lasciare tracce leggibili. Ho usato il set di skill «Superpowers», che fa le stesse fasi con meno cerimonia: per una persona sola i ruoli separati di BMAD aggiungevano documenti senza aggiungere decisioni. In più ha due cose che mi servivano: il TDD obbligatorio (il test prima, visto fallire) e la revisione finale di ogni versione fatta da un contesto «fresco», che ha trovato errori veri (per esempio sui soldi in yen).
- **Riferimento:** D-20, board Trello nel README, `docs/superpowers/specs/` e `plans/`.

### Perché i commit vanno direttamente su `main`, senza branch e pull request?
- **A voce:** in un progetto di una sola persona una pull request non ha nessun revisore e resta una formalità. La qualità la garantiscono i test e la CI a ogni push.
- **A lezione:** branch e PR per ogni card, nel progetto di gruppo.
- **Scartato:** lo stesso schema del gruppo.
- **Riferimento:** D-23, D-66.

### ★ Si può usare senza account? Perché «Ho un codice invito» chiede di registrarsi?
- **A voce:** sono due cose diverse. **Essere nel viaggio** senza account si può: chi organizza aggiunge «Luca» per nome, e Luca sta in spese, quote e saldi senza aver mai aperto l'app. Se un giorno la installa, entra col codice e rivendica il suo posto scegliendo il suo nome. **Usare l'app** invece richiede un account, perché l'app deve sapere chi sei: chi paga, chi scrive in chat, chi carica una foto.
- **Scartato:** l'ospite via link senza account: il link diventerebbe una credenziale (token per dispositivo, scadenza, revoca, cosa può fare l'ospite). È nella roadmap, con una spec sua.
- **Riferimento:** D-02, D-30, D-32, D-74.

### Perché mobile-first?
- **A voce:** in vacanza si usa il telefono. Il riferimento è una larghezza di 430 px.
- **Riferimento:** D-11.

---

## 2. Architettura e stack

| Livello | Scelta | A lezione / alternative | Perché |
|---|---|---|---|
| Backend | **Spring Boot 4.1, Java 25** | come a lezione | tipizzato, sicurezza e validazione già pronte |
| Frontend | **React 19 + TypeScript + Vite** | React con CRA; Angular, JavaScript puro | TypeScript trova gli errori prima del browser; Vite al posto di CRA (§2.1) |
| Database | **PostgreSQL** | come a lezione; MySQL, MongoDB | dati relazionali (viaggi → partecipanti → spese → quote), transazioni, `NUMERIC` esatto per i soldi |
| Schema | **Flyway** | `ddl-auto=update`; Liquibase | schema versionato e ripetibile; `ddl-auto=validate` verifica soltanto (D-09) |
| Chiamate API | **`fetch`** in un client nostro | come a lezione; axios | niente dipendenza per una cosa che il browser fa già |
| Dati lato client | **TanStack Query** | Redux + thunk | gestisce cache e ricaricamenti dei dati del server; nessuno stato globale che giustifichi Redux (§2.4) |
| Moduli | **React Hook Form + Zod** | moduli scritti a mano | validazione dichiarata una volta sola (D-19) |
| Stile | **CSS con token** (`index.css`) | Bootstrap + SASS | leggero; colori per ruolo, tema scuro e stagioni da un solo posto (§2.3) |
| Hosting | **Render**, piano gratuito | come a lezione; Neon per il DB | configurazione in `render.yaml`, backend in Docker (D-08) |

### 2.1 ★ Perché Vite e non Create React App?
- **A voce:** Create React App non è più mantenuto e la documentazione ufficiale di React non lo consiglia più; Vite è lo strumento che React indica oggi. Parte in meno di un secondo, ricarica solo il modulo che cambia e ha il plugin per la PWA.
- **A lezione:** CRA (settimana 9).
- **Cosa cambia in pratica:** la configurazione è un file (`vite.config.ts`) con il proxy verso il backend, il plugin PWA (service worker, manifest) e Vitest che usa la stessa configurazione dei test. Il codice React è identico.
- **Riferimento:** D-19, D-63.

### 2.2 Perché Vitest e non Jest?
- **A voce:** Vitest è il test runner nativo di Vite: stessa configurazione, stessa gestione di TypeScript e dei moduli, e un'API compatibile con Jest (`describe`, `it`, `expect`). Testing Library e axe funzionano uguali.
- **A lezione:** Jest con CRA (settimana 10).
- **Perché diverso:** con Vite, Jest avrebbe richiesto una configurazione separata per TypeScript e per gli `import` dei file statici; Vitest no. I 383 test del frontend girano in meno di un minuto.
- **Riferimento:** D-19, D-66.

### 2.3 ★ Perché CSS puro e non Bootstrap e SASS?
- **A voce:** SplitTrip ha un suo sistema visivo (font, colori per ruolo, tema scuro, sfondi stagionali, accessibilità) definito con le **variabili CSS** in un solo file. Bootstrap avrebbe portato il suo aspetto, da ridisegnare componente per componente, e un peso che su telefono si sente; SASS non serve più, perché le variabili e il nesting ora sono nel CSS del browser.
- **A lezione:** Bootstrap + SASS (settimana 6).
- **Come resta ordinato:** i token (`--accent`, `--negative`, spazi, raggi) in `index.css`, con la versione scura sotto `data-theme`; le regole di uso in `DESIGN.md`; un test (`cssSystem.test.ts`) controlla le regole che contano per l'accessibilità (testo in `rem`, contrasto aumentato, colori forzati).
- **Cosa si perde:** la griglia e i componenti pronti. Flexbox e Grid coprono i layout; i componenti sono pochi e nostri (bottoni, campi, card, modale).
- **Riferimento:** D-26, D-57, D-58, D-65.

### 2.4 ★ Perché TanStack Query e non Redux?
- **A voce:** quasi tutto lo stato di SplitTrip è **stato del server**: viaggi, spese, saldi, messaggi. Redux lo copierebbe in uno store da tenere sincronizzato a mano (azioni, reducer, thunk per ogni chiamata). TanStack Query fa esattamente quel lavoro: scarica, mette in cache, ricarica quando serve e dice se è in attesa o in errore.
- **A lezione:** Redux + thunk (settimana 11).
- **Perché diverso:** lo stato *del client* che resta (utente loggato, tema, suono) è piccolo e sta in un contesto React e nelle preferenze dell'account. In più TanStack Query ha dato due cose che con Redux avrei dovuto scrivere: la **persistenza offline** (cache in IndexedDB, D-63) e il **rilettura automatica** delle pagine dei soldi (`refetchOnMount: 'always'`, D-66).
- **Riferimento:** D-19, D-63.

### 2.5 ★ Perché un monolite e non microservizi?
- **A voce:** una persona, due settimane, un server gratuito. Microservizi vorrebbero dire più deploy, più rete e più punti che si rompono, senza nessun beneficio a questa scala.
- **Come resta ordinato:** il codice è diviso in package per funzionalità (`trip`, `expense`, `chat`…). Le notifiche e la chat ascoltano **eventi interni**, così i moduli non si chiamano a vicenda.
- **Scartato:** architettura esagonale; saldi materializzati a eventi.
- **Riferimento:** D-12.

### 2.6 Perché la Home ha un endpoint tutto suo?
- **A voce:** con dieci viaggi, comporre la Home dal browser costerebbe trenta richieste a un server gratuito. Con `GET /api/me/home` basta una.
- **Riferimento:** D-49. Stessa idea per il riepilogo di fine viaggio (D-53).

### 2.7 Docker: dove lo usate?
- **A voce:** in tre punti. Il database locale gira in Docker (`docker compose up -d db`, più un secondo Postgres per il giro e2e); i test d'integrazione usano **Testcontainers**, che avvia un Postgres vero per la suite; su Render il backend è un'immagine Docker (`Dockerfile`, multi-stage).
- **A lezione:** Docker nel setup della settimana 14. Uguale.

---

## 3. Soldi: la parte che non può sbagliare

### 3.1 ★ Perché `BigDecimal` e non `double`?
- **A voce:** `0.1 + 0.2` in virgola mobile fa `0.30000000000000004`. Con i soldi ogni centesimo deve tornare.
- **Regola:** scala 2 e arrotondamento HALF_UP ovunque; nel database `NUMERIC`.
- **Riferimento:** `CLAUDE.md`, regole.

### 3.2 Cosa succede col centesimo di resto? (10 € diviso 3)
- **A voce:** 3,34 + 3,33 + 3,33. Il centesimo in più va ai primi in un ordine fisso, lo stesso nel server e nell'anteprima del browser, così quello che vedi è quello che viene salvato.
- **Dove:** `EqualSplitter.java`; per presenza e pesi si usa il metodo del resto più grande (`WeightedSplitter`).

### 3.3 ★ Come calcolate i rimborsi? È davvero il numero minimo?
- **A voce:** un algoritmo **greedy**: chi deve di più paga chi deve ricevere di più, finché i conti sono a zero. Con *n* persone servono al massimo *n − 1* rimborsi.
- **Onestà:** il minimo assoluto è un problema NP-difficile. Il greedy è deterministico e basta per un gruppo di amici.
- **Riferimento:** D-14, `BalanceCalculator.java`.

### 3.4 Perché i saldi non sono salvati in una tabella?
- **A voce:** si calcolano ogni volta dalle spese. Così c'è una sola fonte di verità: se modifico o ripristino una spesa, non c'è un saldo salvato che possa restare sbagliato.
- **Bonus:** il calcolo è una classe pura, testabile senza database.
- **Scartato:** una tabella di saldi aggiornata dagli eventi.
- **Riferimento:** D-13.

### 3.5 Perché le spese puntano ai «partecipanti» e non agli utenti?
- **A voce:** nei gruppi veri c'è sempre qualcuno che non scarica l'app. Il partecipante esiste nel viaggio anche senza account, e può collegarsi dopo scegliendo il proprio nome.
- **Conseguenza:** un partecipante non si cancella mai; chi esce ha una data di uscita (`left_at`) e i conti restano giusti.
- **Scartato:** due tabelle (accesso + soldi); utenti «fantasma» con email finte.
- **Riferimento:** D-30, D-32.

### 3.6 Perché il cestino solo per spese e rimborsi?
- **A voce:** i dati dei soldi meritano storico e ripristino. Foto e voci delle liste sono usa e getta.
- **Riferimento:** D-15. Eccezione dichiarata: un messaggio di chat eliminato perde davvero il testo (D-40).

### 3.7 Perché la divisione per notti/giorni? E che fine ha fatto «conta per»?
- **A voce:** chi arriva al terzo giorno non paga le prime due notti. La spesa salva i numeri inviati, così resta stabile anche se poi cambiano le date del viaggio.
- **«Conta per» (½ · 1 · 2):** c'era, ed è stato tolto il giorno della consegna. Era nato come «peso», rinominato dopo una prova con un collega perché la parola era astratta; nei test dal telefono è rimasto difficile da capire, e una coppia si sistema con una spesa a parte. Il motore dei pesi resta nel backend: le spese salvate prima si leggono ancora giuste.
- **Riferimento:** D-31, D-33, D-44, D-75.

### 3.8 ★ Perché le spese non sono paginate?
- **A voce:** un viaggio ha decine di spese, non migliaia: la lista intera di un viaggio pesa pochi KB, meno di una foto. Paginare avrebbe reso più complicati i saldi (che devono vedere tutte le spese), l'anteprima offline e la ricerca a schermo, per un guadagno nullo a questa scala.
- **A lezione:** feed con paginazione e filtri (settimana 15), giusto per un social con migliaia di post.
- **Dove invece c'è un limite:** i messaggi della chat si caricano a blocchi (cursore `before` e dimensione), perché crescono nel tempo; la Home è un endpoint solo (D-49) proprio per non fare una chiamata per viaggio.
- **Quando servirà:** è nella roadmap (funzione 4) per viaggi lunghi o gruppi grandi; con Spring Data basta `Pageable`.
- **Riferimento:** D-49, `docs/ROADMAP.md`.

### 3.9 ★ Come funzionano le valute? Perché il cambio non si ricalcola?
- **A voce:** si scrive l'importo dello scontrino nella sua valuta. Il cambio del giorno arriva dalla Banca Centrale Europea e viene **salvato con la spesa**. Se il cambio domani si muove, i conti di ieri non cambiano.
- **Ogni spesa salva:** importo e valuta dello scontrino, cambio (8 decimali), importo convertito nella valuta del viaggio. I saldi leggono solo quest'ultimo.
- **Perché Frankfurter:** dati BCE, nessuna chiave, uso commerciale permesso. Si chiama **dal server**, con una cache; i tassi si chiedono contro l'euro e il rapporto lo calcoliamo noi, perché il cambio diretto del servizio ha solo 3 cifre significative.
- **Scartato:** chiedere il cambio dal browser; ricalcolarlo ogni volta.
- **Riferimento:** D-69.

### 3.10 Perché lo yen non accetta la virgola?
- **A voce:** yen, fiorino, corona islandese e won non hanno centesimi. Server e browser condividono lo stesso elenco.
- **Scartato:** i decimali di `Currency` di Java, che per il fiorino dice 2 mentre il browser dice 0.
- **Riferimento:** D-70.

---

## 4. Mappe, luoghi e meteo

### 4.1 ★ Perché non Google Maps, come a lezione?
- **A voce:** Google Maps richiede una chiave API legata a un account di fatturazione con carta di credito. Leaflet con OpenStreetMap è gratuito, open source, senza chiave e senza account.
- **A lezione:** integrazione mappe con Google Maps (settimana 18).
- **I motivi in dettaglio:**

| | Google Maps | **Leaflet + OpenStreetMap** (scelto) |
|---|---|---|
| Costo | gratis entro una quota, poi a consumo; carta di credito obbligatoria | gratuito |
| Chiave API | sì, da proteggere e limitare per dominio | nessuna |
| Privacy | lo script di Google carica e traccia nel browser | arrivano solo le immagini della mappa |
| Sicurezza (CSP) | più domini e script esterni da autorizzare | un solo dominio per le immagini (`tile.openstreetmap.org`) |
| Peso | script esterno sempre caricato | libreria piccola, caricata solo quando serve la mappa (pagina Foto, statistiche) |
| Licenza dei dati | proprietaria | dati aperti (ODbL), basta citare «© OpenStreetMap» |

- **Cosa si perde:** Street View e le schede dei locali, che a SplitTrip non servono: la mappa mostra dove sono state scattate le foto.
- **Riferimento:** D-10.

### 4.2 Perché la ricerca dei luoghi passa dal server e non dal browser?
- **A voce:** per tre motivi.
  - al servizio esterno arriva solo il testo cercato, mai chi lo cerca;
  - il servizio gratuito è protetto dai nostri limiti (30 ricerche al minuto) e da una cache;
  - la CSP del sito non deve aprirsi a nuovi domini.
- **Riferimento:** D-46, D-51.

### 4.3 Perché Open-Meteo per i luoghi?
- **A voce:** l'ho misurato. Photon rispondeva in 8–11 secondi e rifiutava l'italiano; Open-Meteo risponde in 0,1 secondi e in italiano.
- **Cosa si perde:** vie e monumenti, perché trova solo località.
- **Riferimento:** D-51 (sostituisce D-46). Il meteo viene dallo stesso servizio, senza chiave, con una cache di 1 ora (D-37).

### 4.4 Perché la destinazione va scelta dall'elenco e non scritta liberamente?
- **A voce:** senza coordinate non ci sono meteo, mappa e stagione dello sfondo. Se il servizio è giù, il viaggio non si salva e l'app lo dice (503), invece di salvare un dato a metà.
- **Riferimento:** D-60.

---

## 5. Foto

### 5.1 ★ Perché le foto nel database e non su Cloudinary, come a lezione?
- **A voce:** sul piano gratuito di Render il disco si cancella a ogni riavvio. Un servizio esterno vuol dire un altro account, un'altra chiave e un'altra cosa che può rompersi in demo. Il database è già lì: zero servizi e zero credenziali in più.
- **A lezione:** upload su un servizio esterno (settimana 16).
- **Come funziona:** la colonna è `bytea`; il server riscrive ogni immagine (sotto) e salva anche una miniatura, così la griglia carica poco. Le foto già viste restano nella cache del telefono (D-63).
- **Onestà:** non scala: il database gratuito ha 1 GB e la banda in uscita costa. Per un lancio vero le foto andrebbero su un object storage (es. Cloudflare R2): è scritto in `docs/costi-operativi.md`, con i numeri.
- **Scartato:** Cloudinary, S3, Supabase, disco di Render.
- **Riferimento:** D-07.

### 5.2 Perché il server riscrive ogni immagine?
- **A voce:** per la privacy e la sicurezza.
  - Le foto del telefono contengono la posizione GPS nei metadati: riscrivendo il JPEG i metadati spariscono. La posizione si salva solo se chi carica lo sceglie, foto per foto.
  - Un file di pochi KB può dichiarare 900 megapixel e saturare la memoria del server. Prima si legge solo l'intestazione e oltre 50 MP si rifiuta.
- **Divisione del lavoro:** il telefono riduce la foto a 1600 px (upload veloci coi dati mobili), il server la ricontrolla e fa la miniatura.
- **Riferimento:** D-35, D-38.

### 5.3 Perché niente video?
- **A voce:** un video pesa cento volte una foto. Nel database non ci starebbe, e il server gratuito da 256 MB non può ricodificarlo. Per i video servirebbe un object storage e una pipeline a parte: fuori scala per due settimane, e non è il centro dell'app (i conti).
- **A lezione:** upload e riproduzione foto/video (settimana 16).

---

## 6. Sicurezza e account

### 6.1 Perché JWT e non sessioni con i cookie?
- **A voce:** l'API è senza stato. Il token viaggia nell'intestazione `Authorization` e il server non deve ricordarsi nessuna sessione.
- **A lezione:** JWT (settimana 14). Uguale, con una differenza: niente libreria JWT esterna, uso quella già inclusa in Spring Security (OAuth2 Resource Server).
- **Riferimento:** D-02, D-21.

### 6.2 Perché il CSRF è disabilitato? Non è pericoloso?
- **A voce:** il CSRF sfrutta i cookie che il browser invia da solo. Noi non usiamo cookie: un sito terzo non può aggiungere l'intestazione col token. In più il CORS accetta solo il nostro frontend.
- **Riferimento:** D-17.

### 6.3 ★ Perché niente autenticazione a due fattori, come a lezione?
- **A voce:** per il contesto e per il tempo. SplitTrip è un'app tra amici con dentro chi ha pagato il gelato, non un conto bancario: la 2FA avrebbe messo un ostacolo a ogni accesso dal telefono in vacanza, dove la rete va e viene. In due settimane ho preferito spendere il tempo su quello che protegge davvero questi dati.
- **A lezione:** 2FA (settimana 20).
- **Cosa c'è al suo posto:** password con hash bcrypt (costo 12) e regole minime; rate limiting sul login per IP; token di 24 ore; «password dimenticata» con token monouso salvato come hash; CSP e CORS stretti; ogni richiesta su un viaggio verifica che tu ne faccia parte.
- **Quando servirà:** TOTP (app di autenticazione) con codici di recupero: circa un giorno, con una tabella per il segreto e un passo in più nel login. È un'estensione, non una rifondazione.
- **Riferimento:** D-18, D-22, D-61, D-29.

### 6.4 Perché nessun refresh token?
- **A voce:** il token dura 24 ore. Il refresh token aggiunge complessità che in due settimane non ripagava.
- **Onestà:** un token rubato resta valido fino alla scadenza. Fa parte delle migliorie possibili.
- **Riferimento:** D-18.

### 6.5 SQL injection e XSS: come siete protetti?
- **A voce:** come a lezione. Le query passano da JPA e da parametri, mai da stringhe concatenate; React fa l'escape di tutto quello che mostra, e la Content Security Policy impedisce script non nostri.
- **In più:** gli errori sono sempre in formato Problem Details, mai uno stack trace; l'id dell'utente viene dal token (`@CurrentUserId`), mai dal corpo della richiesta; le immagini vengono riscritte, quindi un file «travestito» da foto non arriva mai al browser com'è.
- **Riferimento:** D-29, `CLAUDE.md`.

### 6.6 ★ Email: perché solo per la password dimenticata, e non invito e notifiche via email?
- **A voce:** tra amici l'invito si manda nel gruppo WhatsApp o si inquadra il QR: non serve un servizio email e nessun indirizzo viene esposto. L'unica email che non si può evitare è quella per chi scorda la password.
- **A lezione:** sistemi email automatici (settimana 19).
- **Come funziona quella:** link valido 30 minuti e usabile una volta; nel database solo l'hash SHA-256 del token; la risposta è sempre la stessa, così non rivela se un'email è registrata; l'invio parte dall'API HTTP di Brevo **dopo il commit**, perché gli hosting gratuiti spesso bloccano le porte SMTP.
- **Quando servirà:** invito via email, riepilogo a fine viaggio, promemoria di un debito aperto: roadmap n. 13, con la preferenza per spegnerle.
- **Riferimento:** D-05, D-61, D-67.

### 6.7 Come proteggete il login dai tentativi a raffica?
- **A voce:** un rate limiter a finestra scorrevole, scritto a mano: 40 righe e nessuna dipendenza.
- **Dettaglio:** dietro il proxy di Render l'IP vero arriva nell'intestazione `CF-Connecting-IP`.
- **Limite noto:** vale per un'istanza sola. Con più istanze servirebbe Redis.
- **Scartato:** Bucket4j.
- **Riferimento:** D-22, D-29.

### 6.8 Perché si entra con un codice o un QR e non con un invito via email?
- **A voce:** vedi 6.6. Il QR è disegnato nel telefono con una libreria di 10 KB, quindi il codice non passa da servizi esterni.
- **Onestà:** chi ha il codice entra. Tra amici è accettabile; un link per persona costava un giorno in più.
- **Riferimento:** D-05, D-32, D-67.

---

## 7. Tempo reale, notifiche e cache

### 7.1 ★ Perché WebSocket con STOMP? E perché si scrive via REST?
- **A voce:** il WebSocket serve solo a **spingere** le novità, dopo che il database le ha salvate. Le scritture passano dalla REST, che ha già validazione, errori e test.
  - Il socket non può mai mostrare un messaggio che poi non viene salvato.
  - Non serve rifare la sicurezza due volte.
- **A lezione:** notifiche via WebSocket (settimana 18). Uguale nello strumento; la regola «si scrive via REST» è la mia.
- **Sicurezza:** il token va nel frame CONNECT, mai nell'URL (che finirebbe nei log).
- **Scartato:** Server-Sent Events; un protocollo nostro sul WebSocket; scrivere i messaggi via STOMP.
- **Riferimento:** D-39.

### 7.2 Perché la chat è di gruppo e non privata, come a lezione?
- **A voce:** il soggetto di SplitTrip è il viaggio, e il gruppo decide insieme: dove si cena, chi prenota, chi deve a chi. Una chat privata uno-a-uno è un'altra app, e per quella c'è già WhatsApp.
- **A lezione:** chat privata (settimana 19).
- **Cosa c'è di più:** le reazioni, l'emoji picker nostro, «sta scrivendo», le righe-evento (una spesa nuova compare in chat come fotografia del testo) e i non letti per partecipante.
- **Riferimento:** D-40, D-47.

### 7.3 Come nascono le notifiche? Processi asincroni?
- **A voce:** i moduli dei soldi pubblicano un evento (spesa creata, rimborso, nuovo partecipante) e un listener scrive la notifica **dopo il commit** (`@TransactionalEventListener(AFTER_COMMIT)`); lo stesso evento alimenta il WebSocket. Chi compie l'azione non riceve la propria notifica.
- **A lezione:** gestione di processi asincroni (settimana 19). Qui l'asincrono è «dopo il commit»: non serve una coda, perché nessun lavoro dura più di qualche millisecondo. L'unico lavoro lungo, l'elaborazione delle immagini, si fa dentro la richiesta ma fuori dalla transazione.
- **Riferimento:** D-36, D-38.

### 7.4 Perché le cache sono in memoria e non su Redis, come a lezione?
- **A voce:** meteo, proposte di luoghi, cambi e i limiti ai tentativi stanno in mappe in memoria (`ConcurrentHashMap`) con una scadenza. Un'istanza sola, nessun servizio in più da tenere acceso, zero euro.
- **A lezione:** caching (settimana 19), tipicamente con Redis.
- **Limite noto:** con più istanze ogni server avrebbe la sua cache e il suo contatore: a quel punto Redis (o Render Key Value) è la mossa giusta, e le interfacce sono già isolate per cambiarle.
- **Riferimento:** D-22, D-37, D-46, D-69.

### 7.5 Perché non arrivano notifiche push sul telefono?
- **A voce:** sono nella roadmap. Servono le chiavi VAPID e un backend nuovo, e su iPhone funzionano solo con l'app installata. Stima: 1–2 giorni.
- **Riferimento:** `docs/ROADMAP.md`, funzione 8.

---

## 8. App installabile e offline

### 8.1 ★ Perché una PWA e non un'app nativa?
- **A voce:** un solo codice per iPhone, Android e computer. Si installa dal browser, senza store e senza le commissioni del 15–30% sugli acquisti in-app.
- **Riferimento:** D-63, `docs/costi-operativi.md` §6.

### 8.2 ★ Perché offline solo in lettura? Non si potrebbero mettere in coda le spese?
- **A voce:** all'estero senza roaming i conti si vedono lo stesso. Le scritture in coda però rischiano **spese doppie**: se due persone modificano la stessa cosa offline, chi vince?
  - Per i soldi è meglio un «non ora» chiaro che un conto sbagliato.
- **Dettagli:**
  - la cache del service worker contiene solo il guscio dell'app, i font e le foto già viste, mai le risposte JSON dell'API;
  - i dati letti stanno in IndexedDB, marcati con utente e versione;
  - all'uscita dall'account si cancella tutto dal dispositivo.
- **Scartato:** service worker scritto a mano + `localStorage`; modifiche in coda al ritorno della rete.
- **Riferimento:** D-63.

---

## 9. Intelligenza artificiale

### 9.1 ★ Cosa fa l'AI e cosa le mandate?
- **A voce:** dà consigli per il viaggio e suggerisce cosa mettere in valigia. Al modello vanno solo destinazione, date, numero di persone, meteo e le voci già in lista. **Mai nomi, email o importi.**
- **A lezione:** suggerimenti intelligenti tramite API Claude (settimana 19). Uguale nello strumento.
- **Perché Claude Haiku:** veloce ed economico: una generazione costa circa un quarto di centesimo. Il limite è 5 generazioni al giorno per viaggio.
- **Chiave:** solo nelle variabili d'ambiente di Render, mai nel repository.
- **Scartato:** un assistente in chat; un modello più grande; nessun limite.
- **Riferimento:** D-41.

### 9.2 ★ Perché niente OCR degli scontrini, visto a lezione?
- **A voce:** perché un OCR sbagliato produce saldi sbagliati, e per i soldi non basta «quasi giusto». Farlo bene vuol dire: un modello vision che restituisce le righe, una schermata di verifica riga per riga, la somma delle righe che deve tornare col totale, e l'assegnazione delle righe alle persone. È un progetto a sé, ed è nella roadmap con questa forma (funzione 6).
- **A lezione:** estrazione testo da documenti con OCR (settimana 18).
- **Cosa c'è oggi:** lo scontrino si fotografa e resta allegato alla spesa, senza EXIF, come prova.
- **In più:** l'OCR costa a scontrino: è il candidato naturale per il «Pass viaggio» del modello di business.
- **Riferimento:** D-37, `docs/ROADMAP.md` §4.2 e §5, `docs/costi-operativi.md` §6.

### 9.3 Perché niente RAG, memoria AI o agenti?
- **A voce:** il RAG serve quando c'è un corpus di documenti da interrogare; SplitTrip non ne ha. I consigli partono da pochi dati strutturati (destinazione, date, meteo) che stanno tutti nel prompt: una chiamata diretta è più semplice, più economica e non manda in giro niente di personale. Un agente che agisce da solo sui soldi del gruppo è l'ultima cosa che un utente vorrebbe.
- **A lezione:** RAG e memoria AI (settimana 18), agenti personalizzati (settimana 19).
- **Riferimento:** D-41.

---

## 10. Interfaccia

| Domanda | Risposta | Rif. |
|---|---|---|
| Perché nessuna libreria per le emoji? | 6 reazioni fisse più una griglia di 40 emoji coi nomi in italiano: la validazione nel server è banale e il pacchetto resta leggero | D-47 |
| Perché Motion per le animazioni e non solo CSS? | le animazioni CSS ci sono per le piccole cose (transizioni, focus); Motion gestisce l'ingresso e l'uscita dei componenti React e rispetta da solo «riduci movimento». Solo quattro animazioni, ognuna con uno scopo; illustrazioni SVG nostre, senza licenze | D-43 |
| Perché l'immagine per le storie si disegna nel browser? | con Canvas non serve nessuna dipendenza, non c'è carico sul server gratuito e nessun dato esce dal telefono | D-56 |
| Perché le classifiche non riguardano mai i soldi? | nessuno deve sentirsi in imbarazzo per aver speso meno: i soldi hanno già i saldi | D-55 |
| Perché il lampone solo per «devi dare»? | un colore con un solo significato si legge al volo. Non è mai decorazione, e accanto c'è sempre testo e segno | D-58, D-24 |
| Perché lo sfondo cambia con le stagioni? | racconta il viaggio che stai guardando, mentre i colori dei soldi restano fissi e leggibili | D-58 |
| Perché la ruota «Chi offre?» non pesa chi ha pagato meno? | è un gioco, non una scommessa sui conti; il sorteggio usa `crypto.getRandomValues` | D-52 |
| Perché «Da portare (insieme)» e non «Valigia»? | un amico l'aveva letta come la propria valigia: il problema era il nome, non la funzione | D-45 |

---

## 11. Accessibilità, linguaggio e GDPR

### 11.1 ★ Com'è verificata l'accessibilità?
- **A voce:** in tre modi.
  - **Test automatici:** controlli axe nei test di ogni pagina, con 0 violazioni.
  - **Verifica a mano:** tastiera, lettore di schermo, zoom e filtri per il daltonismo.
  - **Impostazioni del telefono:** l'app segue testo grande, contrasto aumentato e colori forzati.
- **Regola base:** mai solo il colore. Ogni importo ha segno e testo («devi dare / devi ricevere»).
- **Riferimento:** D-24, D-65, `docs/accessibilita-verifica.md`.

### 11.2 Perché il linguaggio senza genere? E perché non lo schwa?
- **A voce:** un gruppo di vacanza è misto e ognuno deve ritrovarsi nei testi. Si riformula la frase: «chi organizza», «tutto il gruppo», «Ciao di nuovo».
  - Asterischi e schwa i lettori di schermo non li leggono bene, e molte persone li trovano difficili.
  - Le doppie forme allungano ogni frase.
- **Verifica:** un test scorre i testi dell'app e segnala le forme col genere (`neutralLanguage.test.ts`).
- **Riferimento:** D-64.

### 11.3 ★ GDPR: cosa c'è e cosa manca? Perché non si può cancellare l'account?
- **A voce:** c'è quello che chi si registra deve sapere e accettare: **termini e condizioni**, **informativa sulla privacy** (quali dati, su quale base, a quali fornitori arrivano e dove, per quanto tempo, i diritti), la **casella di accettazione** con data e ora salvate, nessun cookie e quindi nessun banner, dati minimi all'AI, posizione delle foto solo col consenso, metadati tolti dalle immagini.
- **A lezione:** adeguamento GDPR e diritto all'oblio (settimana 20).
- **Cosa manca:** il pulsante **«Elimina account»**. Non è dimenticanza: in SplitTrip un partecipante non si cancella mai (D-30), perché le spese degli altri puntano a lui. Cancellare un account vuol dire **anonimizzare**: togliere email, password, foto e nome lasciando «Partecipante uscito» nei conti del gruppo, che restano giusti. Va deciso bene (cosa resta nelle chat, nelle foto caricate da lui, nei badge) e per questo è nella roadmap (n. 9, circa un giorno). Oggi la cancellazione si chiede al contatto dell'informativa.
- **Onestà:** il contatto nell'informativa è di esempio (`privacy@splittrip.example`), dichiarato come tale: va sostituito se il sito resta online.
- **Riferimento:** D-72, D-73, D-30, `docs/ROADMAP.md` §4.5 n. 9.

---

## 12. Qualità e test

### 12.1 ★ Come sai che funziona?
- **A voce:** più di seicento test.

| Livello | Strumenti | Quanti |
|---|---|---|
| Backend: unitari e integrazione | JUnit 5, MockMvc, **Testcontainers** con un Postgres vero | 259 |
| Frontend | Vitest, Testing Library, MSW, axe | 383 |
| Giro completo nel browser | Playwright: due persone si registrano, entrano col QR, dividono una cena, saldano, aggiungono una spesa in yen | 1 |

- **Metodo:** TDD, cioè prima il test e poi il codice, guardandolo fallire.
- **CI:** GitHub Actions a ogni push, con tre job (backend, frontend, e2e). Alla prima esecuzione ha trovato due errori sui soldi che usando l'app non avevo notato.
- **Riferimento:** D-20, D-66.

### 12.2 Perché Testcontainers e non un database in memoria come H2?
- **A voce:** H2 non è Postgres. Le migrazioni Flyway, i tipi `NUMERIC` e i vincoli si provano sul database vero, lo stesso della produzione. Serve Docker, che c'è già.
- **A lezione:** test unitari e d'integrazione (settimana 16). Uguali nello scopo; il database vero è la differenza.

### 12.3 Perché un solo test end-to-end?
- **A voce:** i test e2e sono lenti e fragili, quindi ne basta uno che percorre il giro che conta: dalla registrazione al saldo. Il resto lo coprono gli oltre seicento test più veloci.
- **Scartato:** farlo girare contro il sito su Render (account veri in produzione, server che dorme).
- **Riferimento:** D-66.

### 12.4 Clean code e analisi statica?
- **A voce:** ESLint con le regole di React e TypeScript sul frontend, `tsc` nella build; sul backend i warning del compilatore e le regole in `CLAUDE.md` (soldi solo in `BigDecimal`, errori solo in Problem Details, accesso sempre da `TripAccessService`), controllate alla revisione di ogni versione.
- **A lezione:** refactoring e analisi statica (settimana 16).

---

## 13. Domande scomode: i limiti noti

Meglio dirli prima che li trovi qualcun altro. Per ognuno c'è già la soluzione.

| Limite | Perché c'è | Come si risolve | Costo |
|---|---|---|---|
| Il server si addormenta dopo 15 minuti | piano gratuito di Render | piano Starter, sempre acceso; intanto l'app avvisa «si sta svegliando» e offline si apre lo stesso | 7 $/mese |
| Il database gratuito scade intorno al 12 novembre | piano gratuito di Render | piano Basic, con backup giornalieri | 6 $/mese |
| Rate limiter, cache e WebSocket in memoria | un'istanza sola | Redis e un broker esterno, se servono più istanze | — |
| Le foto nel database non scalano | scelta per il piano gratuito (D-07) | object storage (Cloudflare R2) | centesimi |
| Il greedy non sempre trova il minimo assoluto di rimborsi | il minimo è NP-difficile (D-14) | resta al massimo *n − 1* rimborsi: con un gruppo di amici bastano | — |
| Un token rubato vale fino a 24 ore | niente refresh token (D-18) | token brevi + refresh token | ~1 giorno |
| Niente 2FA | contesto e tempo (§6.3) | TOTP con codici di recupero | ~1 giorno |
| Niente «Elimina account» | i partecipanti non si cancellano (D-30) | anonimizzazione (§11.3) | ~1 giorno |
| Niente export Excel/Word | le librerie (Apache POI) pesano sul server da 256 MB e il riepilogo di fine viaggio copre il bisogno | export CSV dal browser, roadmap §4.5 n. 4 | 2 h |
| Niente OCR degli scontrini | un OCR sbagliato sbaglia i saldi (§9.2) | modello vision + verifica riga per riga, roadmap funzione 6 | giorni |
| Chi ha il codice invito entra | fiducia tra amici (D-32) | link monouso per persona | ~1 giorno |
| Open-Meteo è gratuito solo per uso non commerciale | condizioni del servizio | licenza commerciale, se l'app diventa a pagamento | 29 $/mese |

Costi e modello di business: `docs/costi-operativi.md`. Migliorie future: `docs/ROADMAP.md`.
