# SplitTrip — perché così

Le scelte logiche e tecniche spiegate come risposte alle domande che possono arrivare alla presentazione del 28 ottobre 2026.

**Come si legge:** per ogni domanda c'è una **risposta da dire a voce** (una o due frasi), poi le **alternative scartate** e il **riferimento** al registro `docs/decisioni.md` (D-xx), dove ogni scelta ha data, motivo e reversibilità. Le domande più probabili sono segnate con ★.

---

## 1. Prodotto e metodo

### ★ Perché un'altra app, se esistono Splitwise e Tricount?
- **A voce:** «Tricount divide i conti, SplitTrip si occupa del viaggio.» Oltre alle spese ci sono quello che serve in vacanza (liste condivise, foto sulla mappa, meteo, chat) e divisioni che quelle app non fanno: per notti di presenza e con chi «conta per due».
- **In più:** funziona offline in sola lettura e chi non ha l'account partecipa lo stesso ai conti.
- **Riferimento:** `docs/ROADMAP.md`, D-28, D-31, D-44.

### Perché rilasci incrementali (v1 → v3.6)?
- **A voce:** ogni versione era presentabile da sola. Se il tempo finiva, si tagliava l'ultima, non metà di tutto.
- **Scartato:** un'unica release alla fine.
- **Riferimento:** D-01, D-27.

### ★ Come hai lavorato? Perché tutta questa documentazione?
- **A voce:** prima la specifica, poi il piano, poi le card su Trello, poi il codice partendo dai test. Ogni scelta va nel registro con le alternative scartate: sono 71 decisioni.
- **Perché:** la progettazione è visibile e si può ricostruire. Questo documento nasce proprio dal registro.
- **Riferimento:** D-20, board Trello nel README.

### Perché i commit vanno direttamente su `main`, senza branch e pull request?
- **A voce:** in un progetto di una sola persona una pull request non ha nessun revisore e resta una formalità. La qualità la garantiscono i test e la CI a ogni push.
- **Scartato:** branch e PR per ogni card, come nel progetto di gruppo.
- **Riferimento:** D-23, D-66.

### ★ Si può usare senza account? Perché «Ho un codice invito» chiede di registrarsi?
- **A voce:** sono due cose diverse. **Essere nel viaggio** senza account si può: chi organizza aggiunge «Dario» per nome, e Dario sta in spese, quote e saldi senza aver mai aperto l'app. Se un giorno la installa, entra col codice e rivendica il suo posto scegliendo il suo nome. **Usare l'app** invece richiede un account, perché l'app deve sapere chi sei: chi paga, chi scrive in chat, chi carica una foto.
- **Scartato:** l'ospite via link senza account: il link diventerebbe una credenziale (token per dispositivo, scadenza, revoca, cosa può fare l'ospite). È nella roadmap, con una spec sua.
- **Riferimento:** D-02, D-30, D-32, D-74.

### Perché mobile-first?
- **A voce:** in vacanza si usa il telefono. Il riferimento è una larghezza di 430 px.
- **Riferimento:** D-11.

---

## 2. Architettura e stack

| Livello | Scelta | Alternative scartate | Perché |
|---|---|---|---|
| Backend | **Spring Boot 4.1, Java 25** | Node/Express | stack del corso, tipizzato, sicurezza e validazione già pronte |
| Frontend | **React 19 + TypeScript + Vite** | Angular, JavaScript puro | stack del corso; TypeScript trova gli errori prima del browser |
| Database | **PostgreSQL** | MySQL, MongoDB | dati relazionali (viaggi → partecipanti → spese → quote), transazioni, `NUMERIC` esatto per i soldi |
| Schema | **Flyway** | `ddl-auto=update`, Liquibase | schema versionato e ripetibile; `ddl-auto=validate` verifica soltanto (D-09) |
| Dati lato client | **TanStack Query** | Redux, axios | gestisce cache e ricaricamenti; nessuno stato globale che giustifichi Redux (D-19) |
| Moduli | **React Hook Form + Zod** | moduli scritti a mano | validazione dichiarata una volta sola (D-19) |
| Stile | **CSS con token** (`index.css`) | Tailwind, librerie di componenti | leggero; colori per ruolo, tema scuro e stagioni da un solo posto (D-26, D-58) |
| Hosting | **Render**, piano gratuito | altri hosting, Neon per il DB | già usato al corso, configurazione in `render.yaml` (D-08) |

### ★ Perché un monolite e non microservizi?
- **A voce:** una persona, due settimane, un server gratuito. Microservizi vorrebbero dire più deploy, più rete e più punti che si rompono, senza nessun beneficio a questa scala.
- **Come resta ordinato:** il codice è diviso in package per funzionalità (`trip`, `expense`, `chat`…). Le notifiche e la chat ascoltano **eventi interni**, così i moduli non si chiamano a vicenda.
- **Scartato:** architettura esagonale; saldi materializzati a eventi.
- **Riferimento:** D-12.

### Perché la Home ha un endpoint tutto suo?
- **A voce:** con dieci viaggi, comporre la Home dal browser costerebbe trenta richieste a un server gratuito. Con `GET /api/me/home` basta una.
- **Riferimento:** D-49. Stessa idea per il riepilogo di fine viaggio (D-53).

---

## 3. Soldi: la parte che non può sbagliare

### ★ Perché `BigDecimal` e non `double`?
- **A voce:** `0.1 + 0.2` in virgola mobile fa `0.30000000000000004`. Con i soldi ogni centesimo deve tornare.
- **Regola:** scala 2 e arrotondamento HALF_UP ovunque; nel database `NUMERIC`.
- **Riferimento:** `CLAUDE.md`, regole.

### Cosa succede col centesimo di resto? (10 € diviso 3)
- **A voce:** 3,34 + 3,33 + 3,33. Il centesimo in più va ai primi in un ordine fisso, lo stesso nel server e nell'anteprima del browser, così quello che vedi è quello che viene salvato.
- **Dove:** `EqualSplitter.java`; per i pesi e le presenze si usa il metodo del resto più grande (`WeightedSplitter`).

### ★ Come calcolate i rimborsi? È davvero il numero minimo?
- **A voce:** un algoritmo **greedy**: chi deve di più paga chi deve ricevere di più, finché i conti sono a zero. Con *n* persone servono al massimo *n − 1* rimborsi.
- **Onestà:** il minimo assoluto è un problema NP-difficile. Il greedy è deterministico e basta per un gruppo di amici.
- **Riferimento:** D-14, `BalanceCalculator.java`.

### Perché i saldi non sono salvati in una tabella?
- **A voce:** si calcolano ogni volta dalle spese. Così c'è una sola fonte di verità: se modifico o ripristino una spesa, non c'è un saldo salvato che possa restare sbagliato.
- **Bonus:** il calcolo è una classe pura, testabile senza database.
- **Scartato:** una tabella di saldi aggiornata dagli eventi.
- **Riferimento:** D-13.

### Perché le spese puntano ai «partecipanti» e non agli utenti?
- **A voce:** nei gruppi veri c'è sempre qualcuno che non scarica l'app. Il partecipante esiste nel viaggio anche senza account, e può collegarsi dopo scegliendo il proprio nome.
- **Conseguenza:** un partecipante non si cancella mai; chi esce ha una data di uscita (`left_at`) e i conti restano giusti.
- **Scartato:** due tabelle (accesso + soldi); utenti «fantasma» con email finte.
- **Riferimento:** D-30, D-32.

### Perché il cestino solo per spese e rimborsi?
- **A voce:** i dati dei soldi meritano storico e ripristino. Foto e voci delle liste sono usa e getta.
- **Riferimento:** D-15. Eccezione dichiarata: un messaggio di chat eliminato perde davvero il testo (D-40).

### Perché la divisione per notti/giorni? E che fine ha fatto «conta per»?
- **A voce:** chi arriva al terzo giorno non paga le prime due notti. La spesa salva i numeri inviati, così resta stabile anche se poi cambiano le date del viaggio.
- **«Conta per» (½ · 1 · 2):** c'era, ed è stato tolto il giorno della consegna. Era nato come «peso», rinominato dopo una prova con un collega perché la parola era astratta; nei test dal telefono è rimasto difficile da capire, e una coppia si sistema con una spesa a parte. Il motore dei pesi resta nel backend: le spese salvate prima si leggono ancora giuste.
- **Riferimento:** D-31, D-33, D-44, D-75.

### ★ Come funzionano le valute? Perché il cambio non si ricalcola?
- **A voce:** si scrive l'importo dello scontrino nella sua valuta. Il cambio del giorno arriva dalla Banca Centrale Europea e viene **salvato con la spesa**. Se il cambio domani si muove, i conti di ieri non cambiano.
- **Ogni spesa salva:** importo e valuta dello scontrino, cambio (8 decimali), importo convertito nella valuta del viaggio. I saldi leggono solo quest'ultimo.
- **Perché Frankfurter:** dati BCE, nessuna chiave, uso commerciale permesso. Si chiama **dal server**, con una cache.
- **Scartato:** chiedere il cambio dal browser; ricalcolarlo ogni volta.
- **Riferimento:** D-69.

### Perché lo yen non accetta la virgola?
- **A voce:** yen, fiorino, corona islandese e won non hanno centesimi. Server e browser condividono lo stesso elenco.
- **Scartato:** i decimali di `Currency` di Java, che per il fiorino dice 2 mentre il browser dice 0.
- **Riferimento:** D-70.

---

## 4. Mappe, luoghi e meteo

### ★ Perché non Google Maps?
- **A voce:** Google Maps richiede una chiave API legata a un account di fatturazione con carta di credito. Leaflet con OpenStreetMap è gratuito, open source, senza chiave e senza account.
- **I motivi in dettaglio:**

| | Google Maps | **Leaflet + OpenStreetMap** (scelto) |
|---|---|---|
| Costo | gratis entro una quota, poi a consumo; carta di credito obbligatoria | gratuito |
| Chiave API | sì, da proteggere e limitare | nessuna |
| Privacy | lo script di Google carica e traccia nel browser | arrivano solo le immagini della mappa |
| Sicurezza (CSP) | più domini e script esterni da autorizzare | un solo dominio per le immagini (`tile.openstreetmap.org`) |
| Peso | script esterno sempre caricato | libreria piccola, caricata solo quando serve la mappa (pagina Foto, statistiche) |
| Licenza dei dati | proprietaria | dati aperti (ODbL), basta citare «© OpenStreetMap» |

- **Cosa si perde:** Street View e le schede dei locali, che a SplitTrip non servono: la mappa mostra dove sono state scattate le foto.
- **Riferimento:** D-10.

### Perché la ricerca dei luoghi passa dal server e non dal browser?
- **A voce:** per tre motivi.
  - al servizio esterno arriva solo il testo cercato, mai chi lo cerca;
  - il servizio gratuito è protetto dai nostri limiti (30 ricerche al minuto) e da una cache;
  - la CSP del sito non deve aprirsi a nuovi domini.
- **Riferimento:** D-46, D-51.

### Perché Open-Meteo per i luoghi?
- **A voce:** l'ho misurato. Photon rispondeva in 8–11 secondi e rifiutava l'italiano; Open-Meteo risponde in 0,1 secondi e in italiano.
- **Cosa si perde:** vie e monumenti, perché trova solo località.
- **Riferimento:** D-51 (sostituisce D-46). Il meteo viene dallo stesso servizio, senza chiave, con una cache di 1 ora (D-37).

### Perché la destinazione va scelta dall'elenco e non scritta liberamente?
- **A voce:** senza coordinate non ci sono meteo, mappa e stagione dello sfondo. Se il servizio è giù, il viaggio non si salva e l'app lo dice (503), invece di salvare un dato a metà.
- **Riferimento:** D-60.

---

## 5. Foto

### ★ Perché le foto nel database e non su Cloudinary o S3?
- **A voce:** sul piano gratuito di Render il disco si cancella a ogni riavvio. Un servizio esterno vuol dire un altro account e altre credenziali. Il database è già lì: zero servizi e zero credenziali in più.
- **Onestà:** non scala. Per un lancio vero le foto andrebbero su un object storage (es. Cloudflare R2), ed è scritto in `docs/costi-operativi.md`.
- **Scartato:** Cloudinary, S3, Supabase, disco di Render.
- **Riferimento:** D-07.

### Perché il server riscrive ogni immagine?
- **A voce:** per la privacy e la sicurezza.
  - Le foto del telefono contengono la posizione GPS nei metadati: riscrivendo il JPEG i metadati spariscono. La posizione si salva solo se chi carica lo sceglie, foto per foto.
  - Un file di pochi KB può dichiarare 900 megapixel e saturare la memoria del server. Prima si legge solo l'intestazione e oltre 50 MP si rifiuta.
- **Divisione del lavoro:** il telefono riduce la foto a 1600 px (upload veloci coi dati mobili), il server la ricontrolla e fa la miniatura.
- **Riferimento:** D-35, D-38.

---

## 6. Sicurezza e account

### Perché JWT e non sessioni con i cookie?
- **A voce:** l'API è senza stato. Il token viaggia nell'intestazione `Authorization` e il server non deve ricordarsi nessuna sessione.
- **Libreria:** quella già inclusa in Spring Security (OAuth2 Resource Server), nessuna libreria JWT esterna.
- **Riferimento:** D-02, D-21.

### Perché il CSRF è disabilitato? Non è pericoloso?
- **A voce:** il CSRF sfrutta i cookie che il browser invia da solo. Noi non usiamo cookie: un sito terzo non può aggiungere l'intestazione col token. In più il CORS accetta solo il nostro frontend.
- **Riferimento:** D-17.

### Perché nessun refresh token?
- **A voce:** il token dura 24 ore. Il refresh token aggiunge complessità che in due settimane non ripagava.
- **Onestà:** un token rubato resta valido fino alla scadenza. Fa parte delle migliorie possibili.
- **Riferimento:** D-18.

### Come proteggete il login dai tentativi a raffica?
- **A voce:** un rate limiter a finestra scorrevole, scritto a mano: 40 righe e nessuna dipendenza.
- **Dettaglio:** dietro il proxy di Render l'IP vero arriva nell'intestazione `CF-Connecting-IP`.
- **Limite noto:** vale per un'istanza sola. Con più istanze servirebbe Redis.
- **Scartato:** Bucket4j.
- **Riferimento:** D-22, D-29.

### Come funziona «Password dimenticata»?
- **A voce:** arriva un link via email, valido 30 minuti e usabile una volta. Nel database c'è solo l'**hash SHA-256** del token, quindi anche chi leggesse il database non potrebbe usarlo.
- **Altri dettagli:**
  - la risposta è sempre la stessa, così non rivela se un'email è registrata;
  - l'email parte dall'API HTTP di Brevo, dopo il commit.
- **Perché l'API e non SMTP:** gli hosting gratuiti bloccano spesso le porte SMTP.
- **Riferimento:** D-61.

### Perché si entra con un codice o un QR e non con un invito via email?
- **A voce:** è come si fa tra amici: il codice si manda nel gruppo WhatsApp o si inquadra il QR. Non serve un servizio email e nessun indirizzo viene esposto.
- **QR:** disegnato nel telefono con una libreria di 10 KB, quindi il codice non passa da servizi esterni.
- **Onestà:** chi ha il codice entra. Tra amici è accettabile; un link per persona costava un giorno in più.
- **Riferimento:** D-05, D-32, D-67.

### Ci sono altre protezioni?
- **Header di sicurezza:** sul sito c'è una Content Security Policy, che dice al browser da quali domini può caricare script, immagini e connessioni.
- **Errori:** sempre in formato Problem Details, mai uno stack trace verso il browser.
- **Identità:** l'id dell'utente viene sempre dal token (`@CurrentUserId`), mai dal corpo della richiesta.
- **Accesso:** ogni operazione su un viaggio controlla prima che tu ne faccia parte (`TripAccessService`).
- **Riferimento:** D-29, `CLAUDE.md`.

---

## 7. Tempo reale e notifiche

### ★ Perché WebSocket con STOMP? E perché si scrive via REST?
- **A voce:** il WebSocket serve solo a **spingere** le novità, dopo che il database le ha salvate. Le scritture passano dalla REST, che ha già validazione, errori e test.
  - Il socket non può mai mostrare un messaggio che poi non viene salvato.
  - Non serve rifare la sicurezza due volte.
- **Sicurezza:** il token va nel frame CONNECT, mai nell'URL (che finirebbe nei log).
- **Scartato:** Server-Sent Events; un protocollo nostro sul WebSocket; scrivere i messaggi via STOMP.
- **Riferimento:** D-39.

### Come nascono le notifiche?
- **A voce:** i moduli dei soldi pubblicano un evento (spesa creata, rimborso, nuovo partecipante) e un listener scrive la notifica **dopo il commit**. Chi compie l'azione non riceve la propria notifica.
- **Riferimento:** D-36.

### Perché non arrivano notifiche push sul telefono?
- **A voce:** sono nella roadmap. Servono le chiavi VAPID e un backend nuovo, e su iPhone funzionano solo con l'app installata. Stima: 1–2 giorni.
- **Riferimento:** `docs/ROADMAP.md`, funzione 8.

---

## 8. App installabile e offline

### ★ Perché una PWA e non un'app nativa?
- **A voce:** un solo codice per iPhone, Android e computer. Si installa dal browser, senza store e senza le commissioni del 15–30% sugli acquisti in-app.
- **Riferimento:** D-63, `docs/costi-operativi.md` §6.

### ★ Perché offline solo in lettura? Non si potrebbero mettere in coda le spese?
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

### ★ Cosa fa l'AI e cosa le mandate?
- **A voce:** dà consigli per il viaggio e suggerisce cosa mettere in valigia. Al modello vanno solo destinazione, date, numero di persone, meteo e le voci già in lista. **Mai nomi, email o importi.**
- **Perché Claude Haiku:** veloce ed economico: una generazione costa circa un quarto di centesimo. Il limite è 5 generazioni al giorno per viaggio.
- **Chiave:** solo nelle variabili d'ambiente di Render, mai nel repository.
- **Scartato:** un assistente in chat; un modello più grande; nessun limite.
- **Riferimento:** D-41.

---

## 10. Interfaccia

| Domanda | Risposta | Rif. |
|---|---|---|
| Perché nessuna libreria per le emoji? | 6 reazioni fisse più una griglia di 40 emoji coi nomi in italiano: la validazione nel server è banale e il pacchetto resta leggero | D-47 |
| Perché Motion per le animazioni? | gestisce l'ingresso e l'uscita dei componenti React e rispetta da solo «riduci movimento». Solo quattro animazioni, ognuna con uno scopo; illustrazioni SVG nostre, senza licenze | D-43 |
| Perché l'immagine per le storie si disegna nel browser? | con Canvas non serve nessuna dipendenza, non c'è carico sul server gratuito e nessun dato esce dal telefono | D-56 |
| Perché le classifiche non riguardano mai i soldi? | nessuno deve sentirsi in imbarazzo per aver speso meno: i soldi hanno già i saldi | D-55 |
| Perché il lampone solo per «devi dare»? | un colore con un solo significato si legge al volo. Non è mai decorazione, e accanto c'è sempre testo e segno | D-58, D-24 |
| Perché lo sfondo cambia con le stagioni? | racconta il viaggio che stai guardando, mentre i colori dei soldi restano fissi e leggibili | D-58 |
| Perché la ruota «Chi offre?» non pesa chi ha pagato meno? | è un gioco, non una scommessa sui conti; il sorteggio usa `crypto.getRandomValues` | D-52 |
| Perché «Da portare (insieme)» e non «Valigia»? | un amico l'aveva letta come la propria valigia: il problema era il nome, non la funzione | D-45 |

---

## 11. Accessibilità e linguaggio

### ★ Com'è verificata l'accessibilità?
- **A voce:** in tre modi.
  - **Test automatici:** controlli axe nei test di tutte le 22 pagine, con 0 violazioni.
  - **Verifica a mano:** tastiera, lettore di schermo, zoom e filtri per il daltonismo.
  - **Impostazioni del telefono:** l'app segue testo grande, contrasto aumentato e colori forzati.
- **Regola base:** mai solo il colore. Ogni importo ha segno e testo («devi dare / devi ricevere»).
- **Riferimento:** D-24, D-65, `docs/accessibilita-verifica.md`.

### Perché il linguaggio senza genere? E perché non lo schwa?
- **A voce:** un gruppo di vacanza è misto e ognuno deve ritrovarsi nei testi. Si riformula la frase: «chi organizza», «tutto il gruppo», «Ciao di nuovo».
  - Asterischi e schwa i lettori di schermo non li leggono bene, e molte persone li trovano difficili.
  - Le doppie forme allungano ogni frase.
- **Verifica:** un test scorre i testi dell'app e segnala le forme col genere (`neutralLanguage.test.ts`).
- **Riferimento:** D-64.

---

## 12. Qualità e test

### ★ Come sai che funziona?
- **A voce:** più di seicento test.

| Livello | Strumenti | Quanti |
|---|---|---|
| Backend: unitari e integrazione | JUnit 5, MockMvc, **Testcontainers** con un Postgres vero | 254 |
| Frontend | Vitest, Testing Library, MSW, axe | 370 |
| Giro completo nel browser | Playwright: due persone si registrano, entrano col QR, dividono una cena, saldano, aggiungono una spesa in yen | 1 |

- **Metodo:** TDD, cioè prima il test e poi il codice, guardandolo fallire.
- **CI:** GitHub Actions a ogni push, con tre job (backend, frontend, e2e). Alla prima esecuzione ha trovato due errori sui soldi che usando l'app non avevo notato.
- **Riferimento:** D-20, D-66.

### Perché Testcontainers e non un database in memoria come H2?
- **A voce:** H2 non è Postgres. Le migrazioni Flyway, i tipi `NUMERIC` e i vincoli si provano sul database vero, lo stesso della produzione.

### Perché un solo test end-to-end?
- **A voce:** i test e2e sono lenti e fragili, quindi ne basta uno che percorre il giro che conta: dalla registrazione al saldo. Il resto lo coprono gli oltre seicento test più veloci.
- **Scartato:** farlo girare contro il sito su Render (account veri in produzione, server che dorme).
- **Riferimento:** D-66.

---

## 13. Domande scomode: i limiti noti

Meglio dirli prima che li trovi qualcun altro. Per ognuno c'è già la soluzione.

| Limite | Perché c'è | Come si risolve | Costo |
|---|---|---|---|
| Il server si addormenta dopo 15 minuti | piano gratuito di Render | piano Starter, sempre acceso; intanto l'app avvisa «si sta svegliando» e offline si apre lo stesso | 7 $/mese |
| Il database gratuito scade intorno al 12 novembre | piano gratuito di Render | piano Basic, con backup giornalieri | 6 $/mese |
| Rate limiter e WebSocket in memoria | un'istanza sola | Redis e un broker esterno, se servono più istanze | — |
| Le foto nel database non scalano | scelta per il piano gratuito (D-07) | object storage (Cloudflare R2) | centesimi |
| Il greedy non sempre trova il minimo assoluto di rimborsi | il minimo è NP-difficile (D-14) | resta al massimo *n − 1* rimborsi: con un gruppo di amici bastano | — |
| Un token rubato vale fino a 24 ore | niente refresh token (D-18) | token brevi + refresh token | ~1 giorno |
| Chi ha il codice invito entra | fiducia tra amici (D-32) | link monouso per persona | ~1 giorno |
| Open-Meteo è gratuito solo per uso non commerciale | condizioni del servizio | licenza commerciale, se l'app diventa a pagamento | 29 $/mese |

Costi e modello di business: `docs/costi-operativi.md`. Migliorie future: `docs/ROADMAP.md`.
