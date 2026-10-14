# 🧳 SplitTrip

> **Accompagnare i gruppi di amici in ogni fase della vacanza:** pianificare insieme prima di partire, tenere traccia di spese e cose da fare durante, e ritrovarsi con ricordi condivisi e conti chiari al ritorno.

🔗 **Demo:** https://splittrip-750q.onrender.com
📘 **API (Swagger):** https://splittrip-api.onrender.com/swagger-ui.html

> ⏳ Il backend gira sul piano gratuito di Render: dopo un periodo di inattività si addormenta e la **prima richiesta può impiegare fino a un minuto**. L'app lo segnala con un avviso «Il server si sta svegliando…».

Progetto finale (capstone) del corso fullstack: frontend React + TypeScript, backend Java Spring Boot, PostgreSQL.

---

## ✨ Cosa fa

- 🔐 **Registrazione e login** con JWT
- ✈️ **Viaggi** con stato (in pianificazione → in corso → chiuso) e **codice invito** da condividere su WhatsApp
- 💸 **Spese** divise in parti uguali, con importi personalizzati, **per peso** (la coppia con un solo telefono conta per due, il bambino per mezzo) o **per presenza** (notti o giorni: chi arriva dopo paga meno alloggio), con l'anteprima delle quote
- 👵 **Partecipanti senza account**: l'organizzatore aggiunge chi non usa l'app, che ha comunque la sua quota; se poi si registra, entrando col codice **rivendica il suo posto** e ritrova le sue spese
- 🧳 **La mia partecipazione**: ognuno imposta peso e date di arrivo e partenza, o lascia il viaggio senza perdere lo storico
- ⚖️ **Saldi** sempre aggiornati e **trasferimenti suggeriti**: il minimo di rimborsi per azzerare i debiti del gruppo
- 🔁 **Rimborsi** registrabili con un tap da «Salda»
- 🗑️ **Cestino** delle spese con ripristino (organizzatore)
- 🔒 Viaggio chiuso in **sola lettura**: i conti restano consultabili
- ♿ Interfaccia **mobile-first e accessibile**: ogni importo ha segno e testo («devi dare / devi ricevere»), mai solo il colore

## 📸 Screenshot

| Dashboard del viaggio | Nuova spesa | Saldi |
|---|---|---|
| ![Dashboard mobile](docs/screenshots/mobile-dashboard.png) | ![Form nuova spesa](docs/screenshots/mobile-expense-form.png) | ![Saldi e pareggio](docs/screenshots/mobile-balances.png) |

![Dashboard desktop](docs/screenshots/desktop-dashboard.png)

## 🗺️ Roadmap

| Versione | Contenuto | Stato |
|---|---|---|
| **v1 Core** | auth, viaggi, spese, rimborsi, saldi | ✅ |
| **v1.5 Divisioni smart** | divisione per presenza e per peso, partecipanti senza account rivendicabili, modello dati pronto per multi-valuta | ✅ |
| **v2 Social** | to-do e valigia condivisa, foto con mappa, notifiche | 📋 |
| **v3 Live** | chat di gruppo e notifiche in tempo reale (WebSocket) | 📋 |

La visione di prodotto oltre il capstone (ospiti senza registrazione, multi-valuta, scontrino diviso per voce, riepilogo condivisibile): [`docs/ROADMAP.md`](docs/ROADMAP.md).

## 🏗️ Stack

| Livello | Tecnologie |
|---|---|
| **Backend** | Java 25, Spring Boot 4.1 (WebMVC, Data JPA / Hibernate 7, Security 7 + OAuth2 Resource Server, Validation, Actuator), Flyway, springdoc-openapi |
| **Database** | PostgreSQL 16 |
| **Frontend** | React 19, TypeScript, Vite, React Router, TanStack Query, React Hook Form + Zod, date-fns |
| **Design** | DM Sans, Material Symbols, token CSS (nessun framework CSS) — sistema documentato in [`DESIGN.md`](DESIGN.md) |
| **Test** | JUnit 5, Mockito, Testcontainers, MockMvc · Vitest, Testing Library, MSW |
| **Deploy** | Render (backend Docker, frontend statico, Postgres) via [`render.yaml`](render.yaml) |

## 🚀 Avvio in locale

**Prerequisiti:** Java 25, Node 24, Docker.

```bash
git clone https://github.com/Valelearn1/SplitTrip.git
cd SplitTrip

# 1. Database (porta 5432)
docker compose up -d db

# 2. Backend → http://localhost:8080 (Swagger su /swagger-ui.html)
cd BE && sh mvnw spring-boot:run

# 3. Frontend → http://localhost:5173 (in un altro terminale)
cd FE && npm ci && npm run dev
```

Flyway crea le tabelle al primo avvio. Il frontend inoltra `/api` al backend tramite il proxy di Vite.

> 💡 Se sulla porta 5432 gira già un altro Postgres (es. Homebrew: `brew services stop postgresql@18`), fermalo o cambia la porta in `docker-compose.yml`.

### Variabili d'ambiente

Tutte hanno un valore di default per lo sviluppo: in locale non serve impostarne nessuna.

| Variabile | Dove | Default in sviluppo | In produzione |
|---|---|---|---|
| `DATABASE_URL` | BE | `jdbc:postgresql://localhost:5432/splittrip` | dal database Render (formato `postgresql://…`, convertito in automatico) |
| `JWT_SECRET` | BE | segreto di sviluppo | generato da Render, almeno 32 byte |
| `CORS_ORIGIN` | BE | `http://localhost:5173` | URL del frontend |
| `VITE_API_URL` | FE | `/api` (proxy Vite) | URL dell'API |

## 🧪 Test

```bash
cd BE && sh mvnw test   # 97 test: unitari + integrazione con Postgres reale (serve Docker)
cd FE && npm test       # 34 test
```

Cosa coprono:
- ⚖️ **motore dei saldi** al 100 %: somma dei netti sempre zero, centesimi di resto deterministici, al massimo n−1 trasferimenti
- 🧮 **divisione per peso e per presenza**: stessi esempi di riferimento nel backend e nel frontend (resto maggiore, Σ quote = totale)
- 🗃️ **migrazione dei dati**: test che applica la V1, inserisce dati reali (anche un ex membro nel cestino) e verifica la V2
- 🔄 **flussi API end-to-end** su Postgres reale (Testcontainers): registrazione → viaggio → invito → spese → rimborsi → saldi
- 🔒 **sicurezza**: 401/403, SQL injection, XSS, id utente preso solo dal token, nessuno stack trace negli errori
- 🖥️ **frontend**: client API, rotte protette, form spesa (validazione delle quote), saldi e «Salda»

Sviluppato in **TDD**: ogni test è stato visto fallire prima di scrivere il codice.

## 🔒 Sicurezza e privacy

| Rischio | Difesa |
|---|---|
| **SQL injection** | JPA con query parametrizzate, nessuna concatenazione di stringhe |
| **XSS** | escape automatico di React, `Content-Security-Policy` e `X-Content-Type-Options` sulla pagina dell'app (header del sito statico in `render.yaml`), lunghezze massime lato server |
| **CSRF** | API stateless con JWT nell'header `Authorization` (nessun cookie di sessione); CORS limitato al frontend — motivazione in [`docs/decisioni.md`](docs/decisioni.md) (D-17) |
| **Brute force** | rate limiting su login e registrazione (10 tentativi/minuto per IP; dietro il proxy di Render l'IP si legge dall'header di Cloudflare) |
| **Password** | BCrypt, mai in chiaro; messaggio di errore generico al login |
| **Dati personali** | solo email e nome; il token contiene solo l'id utente; segreti in variabili d'ambiente; HTTPS su Render |
| **Autorizzazione** | ogni operazione verifica l'appartenenza al viaggio; l'id utente viene sempre dal token, mai dal body |

## 📐 Progettazione

Il progetto è sviluppato con un metodo **spec-driven**: prima la specifica, poi il piano, poi il codice.

| Documento | Contenuto |
|---|---|
| [`docs/superpowers/specs/`](docs/superpowers/specs/) | specifiche di design: v1 (modello dati, motore dei saldi, API, sicurezza, frontend) e v1.5 (partecipanti, peso e presenza) |
| [`docs/superpowers/plans/`](docs/superpowers/plans/) | piani di implementazione task per task |
| [`docs/decisioni.md`](docs/decisioni.md) | registro delle decisioni, con alternative scartate e motivazioni |
| [`PRODUCT.md`](PRODUCT.md) · [`DESIGN.md`](DESIGN.md) | prodotto e sistema visivo |
| [`docs/stitch/`](docs/stitch/) | schermate di riferimento generate con Stitch |
| Board Trello | una card per task, con checklist |

## 📂 Struttura del repository

```
SplitTrip/
├── BE/                         backend Spring Boot
│   ├── src/main/java/com/splittrip/
│   │   ├── auth/               JWT, sicurezza, registrazione e login
│   │   ├── user/               utenti
│   │   ├── trip/               viaggi, membri, codice invito, controllo accessi
│   │   ├── expense/            spese, quote, rimborsi, motore dei saldi
│   │   └── common/             errori, configurazione
│   ├── src/main/resources/db/migration/   migrazioni Flyway
│   └── Dockerfile
├── FE/                         frontend React
│   └── src/
│       ├── app/                router, layout
│       ├── features/           auth · trips · expenses · balances
│       └── shared/             client API, componenti UI, formattazione
├── docs/                       spec, piani, decisioni, roadmap, screenshot
├── docker-compose.yml          Postgres locale
└── render.yaml                 deploy su Render
```

---

Fatto con ☕ e tanti test da Valentina.
