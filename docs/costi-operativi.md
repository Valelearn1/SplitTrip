# SplitTrip — costi operativi

Analisi del 21 ottobre 2026. Prezzi in dollari come li pubblicano i servizi; in euro al cambio BCE del 20 ottobre (1 $ = 0,89 €). Le stime d'uso sono ipotesi dichiarate, non misure.

## 1. Cosa usa l'app oggi

| Servizio | A cosa serve | Piano attuale | Costo oggi | Limiti del piano gratuito |
|---|---|---|---|---|
| **Render: web service** (backend Docker) | API, WebSocket, elaborazione delle foto | Free | 0 € | si spegne dopo 15 minuti senza traffico, si riaccende in circa un minuto; 750 ore al mese per workspace |
| **Render: static site** (frontend) | il sito e la PWA | gratuito | 0 € | rientra nella banda del workspace |
| **Render: Postgres** | dati e foto (D-07: le foto stanno nel database) | Free | 0 € | **scade 30 giorni dopo la creazione**, poi 14 giorni di tolleranza e viene cancellato; 1 GB; nessun backup |
| **Render: banda in uscita** | pagine, API, foto | Hobby | 0 € | 5 GB al mese (dal 1° agosto 2026), oltre 0,15 $/GB |
| **Anthropic API** (Claude Haiku 4.5) | consigli per il viaggio e per la valigia (D-41) | a consumo | pochi centesimi | 1 $ per milione di token in ingresso, 5 $ in uscita; l'app limita a 5 generazioni al giorno per viaggio |
| **Brevo** | email di ripristino della password (D-61) | Free | 0 € | 300 email al giorno |
| **Open-Meteo** | meteo e proposte di luoghi (D-46, D-51) | gratuito | 0 € | **solo uso non commerciale**; 10.000 chiamate al giorno |
| **Frankfurter** | cambio del giorno (D-69) | gratuito | 0 € | nessuna chiave, nessuna quota, uso commerciale permesso |
| **GitHub Actions** | CI: backend, frontend, giro e2e (D-66) | Free, repository privato | 0 € | 2.000 minuti al mese; un push ne consuma circa 9–10 (tre job) → circa 200 push al mese |

**Costo attuale: 0 € al mese**, più qualche centesimo di consigli AI.

## 2. Costi unitari

| Voce | Calcolo | Costo |
|---|---|---|
| Una generazione di consigli AI | circa 700 token in ingresso + 400 in uscita (massimo 1.024) | ≈ 0,003 $ (massimo 0,006 $) ≈ **0,25 centesimi** |
| Un viaggio che usa tutte le generazioni AI per 7 giorni | 5 al giorno × 7 | ≈ 0,10 $ ≈ **9 centesimi** |
| Una foto nel database | 1600 px riscritta in JPEG ≈ 300 KB + miniatura 13 KB (misurato in locale: 151 KB di media sulle foto di prova) | 0,3 MB × 0,30 $/GB/mese ≈ **0,01 centesimi al mese** |
| Un viaggio con 50 foto | 15 MB di database | ≈ 0,4 centesimi al mese |
| Una foto vista | ~300 KB di banda | 5 GB gratuiti ≈ 17.000 foto viste al mese; oltre, ≈ 0,005 centesimi a foto |
| Un push | ~9–10 minuti di CI | gratuito entro 2.000 minuti; oltre 0,006 $/minuto ≈ 6 centesimi a push |

## 3. Tre scenari

| | **A. Capstone e demo** (oggi → 28 ottobre) | **B. Uso vero, piccolo** (gruppi di amici: ~50 persone, ~10 viaggi attivi al mese) | **C. Lancio** (~2.000 persone al mese, ~500 viaggi attivi) |
|---|---|---|---|
| Web service | Free (0 $) | Starter 512 MB, sempre acceso: **7 $** | Standard 2 GB (le foto si elaborano in memoria): **25 $** |
| Database | Free (0 $) | Basic-256mb **6 $** + 1 GB **0,30 $** | Basic-1gb **19 $** + ~10 GB (foto) **3 $** |
| Banda | entro 5 GB | entro 5 GB | ~50 GB → 45 GB oltre la soglia: **≈ 7 $** |
| AI | centesimi | ≈ **0,50 $** | 500 viaggi × ~10 generazioni ≈ **15 $** |
| Email | Brevo Free | Brevo Free | Brevo Free (300 al giorno bastano per i ripristini; con l'invito per email, Starter **9 $**) |
| Meteo e luoghi | Open-Meteo gratuito | gratuito (non commerciale) | se l'app guadagna: licenza commerciale **29 $** |
| Cambi | 0 $ | 0 $ | 0 $ |
| CI | 0 $ | 0 $ | 0 $ (o repository pubblico: illimitato) |
| **Totale al mese** | **≈ 0 €** | **≈ 14 $ ≈ 12,50 €** | **≈ 100–110 $ ≈ 90–100 €** |
| **Per viaggio attivo** | — | ≈ 1,25 € | ≈ 0,20 € |

## 4. Rischi da sapere

| Rischio | Quando | Effetto | Cosa fare |
|---|---|---|---|
| **Il database gratuito scade** | creato il 13 ottobre → scade intorno al **12 novembre**, cancellato intorno al **26 novembre** | tutti i dati del sito pubblicato si perdono | se il sito deve restare online dopo la valutazione: passare a Basic-256mb (6 $/mese) prima del 12 novembre, oppure esportare i dati (`pg_dump`). Controllare la data esatta nella dashboard di Render |
| Server che dorme | dopo 15 minuti senza traffico | la prima apertura aspetta circa un minuto (l'app lo dice: «si sta svegliando») | prima della demo: `curl https://splittrip-api.onrender.com/actuator/health`; con Starter (7 $) il problema sparisce |
| Banda ridotta a 5 GB | dal 1° agosto 2026 | molte foto viste → 0,15 $/GB | le foto già viste restano nella cache del telefono (D-63); al lancio, foto su un object storage (es. Cloudflare R2: 0,015 $/GB, banda in uscita gratuita) invece che nel database (rivedere D-07) |
| Open-Meteo solo non commerciale | se SplitTrip diventa a pagamento | licenza obbligatoria (29 $/mese) | per il capstone non serve |
| Consigli AI | una persona che genera di continuo | il limite di 5 al giorno per viaggio tiene il costo sotto i 3 centesimi al giorno per viaggio | nessuna azione |
| Nessun backup nel piano gratuito | sempre | un errore cancella i dati | i piani Basic hanno backup giornalieri |

## 5. In sintesi

- **Oggi SplitTrip costa zero**: tutti i servizi sono gratuiti e l'AI costa frazioni di centesimo, limitata per viaggio.
- **Per tenerlo online davvero** bastano circa **12–13 € al mese**: server sempre acceso e database che non scade.
- **Il costo cresce con le foto, non con le persone**: foto nel database e banda in uscita. È la prima cosa da cambiare per un lancio (object storage), insieme alla licenza del meteo se l'app diventa a pagamento.
- **Prima scadenza concreta: il database gratuito, intorno al 12 novembre 2026.**

## 6. Modello di business: freemium con «Pass viaggio»

Idea già in `docs/ROADMAP.md` (funzione 13): **tutto quello che serve per dividere i conti resta gratuito**; chi organizza può comprare un **Pass viaggio una tantum** che sblocca gli extra per tutto il gruppo, solo su quel viaggio.

| Gratuito | Con il Pass viaggio |
|---|---|
| viaggi, spese e tutte le divisioni, saldi e «Salda», valute, liste, chat, offline, QR | riepilogo di fine viaggio (Wrapped, «Indovina il totale», immagine per le storie), scontrino letto dalla foto (OCR, da fare), consigli AI senza limite giornaliero |

**Perché un Pass per viaggio e non un abbonamento:** un viaggio di gruppo capita una o due volte l'anno; paga chi organizza e ne beneficia tutto il gruppo, quindi il costo a testa è minimo.

**Perché solo web (PWA):** sulle app native i beni digitali vanno venduti con gli acquisti in-app di Apple e Google (15–30% di commissione); col pagamento web (Stripe Checkout, oppure Lemon Squeezy o Paddle, che gestiscono anche l'IVA) la commissione è di pochi centesimi.

### Conti di massima (ipotesi da verificare)

| Voce | Valore |
|---|---|
| Prezzo del Pass | **3,99 €** IVA inclusa |
| IVA (22%, vendita digitale a consumatori UE) | − 0,72 € |
| Commissione del pagamento (carte UE, circa 1,5% + 0,25 €) | − 0,31 € |
| **Ricavo netto per Pass** | **≈ 2,96 €** |
| Costo di un viaggio attivo (§3) | 0,20 € (lancio) – 1,25 € (uso piccolo) |

| Scenario | Viaggi attivi al mese | Pass venduti (ipotesi: 1 viaggio su 10) | Ricavi netti | Costi (§3) | Risultato |
|---|---|---|---|---|---|
| B. Uso vero, piccolo | 10 | 1 | ≈ 3 € | ≈ 12,50 € | **−9,50 €**: a questa scala si regge come progetto personale |
| C. Lancio | 500 | 50 | ≈ 148 € | ≈ 95 € | **+53 €** |
| Pareggio al lancio | — | **≈ 32 Pass al mese** | 95 € | 95 € | 0 |

**Lettura:** il modello sta in piedi perché un viaggio costa pochi centesimi e un Pass ne rende quasi 3 €; serve però volume (qualche centinaio di viaggi al mese). Prima di costruire i pagamenti, la cosa da misurare è quanti gruppi aprono davvero il riepilogo di fine viaggio: è la funzione che si pagherebbe.

**Alternative valutate:** link di affiliazione nei consigli AI (hotel, esperienze, assicurazioni: guadagno senza far pagare nessuno, ma i consigli devono restare onesti e senza dati personali, D-41); abbonamento «Pro» per agenzie o associazioni che organizzano molti viaggi (entrate ricorrenti, ma è un altro mercato); donazioni (attrito zero, entrate imprevedibili).

## Fonti

- Render: [Render.com in mid-2026](https://jwatte.com/blog/render-com-platform-review.md), [Render pricing in 2026](https://servercompass.app/blog/render-pricing-is-it-worth-it), [pagina prezzi](https://render.com/pricing)
- Anthropic: [prezzi dei modelli](https://platform.claude.com/docs/en/about-claude/pricing) (Claude Haiku 4.5: 1 $ / 5 $ per milione di token)
- Open-Meteo: [prezzi e condizioni](https://open-meteo.com/en/pricing), [API Standard a 29 $](https://openmeteo.substack.com/p/api-subscriptions-for-commercial)
- Brevo: [Brevo pricing 2026](https://www.sendx.io/blog/brevo-pricing-plans-costs-alternatives-2026)
- GitHub Actions: [fatturazione](https://docs.github.com/en/billing/concepts/product-billing/github-actions)
- Frankfurter: [frankfurter.dev](https://frankfurter.dev/)
- Stripe: [prezzi per l'Italia](https://stripe.com/it/pricing) (da verificare al momento dell'attivazione)
- Cambio dollaro/euro: Frankfurter, BCE del 20 ottobre 2026
