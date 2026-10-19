# 🎬 Copione della demo — 3 minuti

Due dispositivi: **PC** collegato al proiettore, entrato come **Vale**; **telefono** in mano, entrato come **Marco**.
I dati li crea `docs/demo/seed-demo.py` (vedi «Prima di salire sul palco»).

| Tempo | Cosa mostri | Cosa dici |
|---|---|---|
| **0:00–0:20** | PC: la **Home** di Vale, con «Lisbona 2026» in evidenza («In corso · giorno 3 di 6», meteo, «Ti devono …») | «In vacanza con gli amici i conti diventano un foglio Excel e cinquanta messaggi su WhatsApp. SplitTrip tiene tutto in un posto: chi ha pagato, chi deve cosa, cosa portare, le foto. Questa è la Home: il viaggio in corso, il meteo di oggi, quanto mi devono.» |
| **0:20–0:55** | PC: **Spese** → apri «Casa ad Alfama» (divisa **per notti**: Marco ne ha 4, gli altri 5) → apri «Cena a Bairro Alto» (**Marco conta per 2**, Nonna Pina per **½**, lei non ha l'app) | «Le spese vere non si dividono in parti uguali. Marco è arrivato un giorno dopo: paga una notte in meno. Viaggia in coppia con un solo telefono: conta per due. E la nonna, che non usa l'app, ha comunque la sua quota.» |
| **0:55–1:20** | PC: **Saldi** → i trasferimenti suggeriti → tocca **«Salda»** su una riga | «Alla fine il problema è chi dà quanto a chi. L'app calcola il numero minimo di bonifici per tornare in pari; con un tocco li registri.» |
| *(se c'è tempo, +30 s)* | Telefono (Marco, app **installata**): chiudi l'app, attiva la **modalità aereo**, riaprila dall'icona → Home, viaggio e saldi ci sono, con «Sei offline · dati delle…»; tocca «Nuova spesa»: serve la rete → disattiva la modalità aereo: «Di nuovo online» | «E all'estero senza roaming? L'app è installata sul telefono: senza rete i conti si consultano lo stesso, con l'ora dei dati. Le modifiche aspettano la rete, così nessuna spesa finisce doppia.» |
| **1:20–1:50** | Telefono (Marco): **Chat** → scrive «Arrivo tra 10 minuti!» → sul PC il messaggio compare **subito**; dal PC tieni premuto… o «Reagisci» → 👍 → sul telefono la reazione appare | «È anche il posto dove il gruppo si parla: tempo reale, senza ricaricare. Le spese aggiunte compaiono in chat con il link.» |
| **1:50–2:20** | PC: **«Chi offre?»** → la ruota gira tra i nomi → si ferma su qualcuno → crea la spesa del caffè | «E quando nessuno vuole decidere chi offre il caffè… decide la ruota. E la spesa è già registrata.» |
| **2:20–2:45** | PC: Home → **«I vostri viaggi in numeri»** → **Berlino** → «Indovina il totale»: scrivi 600 → **Scommetto!** → il totale sale a 664 € e «Ha indovinato meglio: Marco» → **Guarda i numeri** → scorri: categorie, badge → in fondo **«Crea l'immagine per le storie»** | «A fine viaggio, il racconto. Prima un gioco: quanto abbiamo speso? Marco ci è andato più vicino. Poi i numeri, i badge di ognuno e un'immagine da mettere nelle storie, senza i saldi di nessuno.» |
| **2:45–3:00** | PC: torna alla Home (o la slide finale) | «Dietro: Spring Boot e React, oltre 300 test scritti prima del codice, accessibile (mai solo il colore), in produzione su Render. SplitTrip: vacanze tra amici, conti chiari. Grazie!» |


## Prima di salire sul palco

1. **La mattina della demo** crea dati freschi (le date di Lisbona partono da oggi):
   ```bash
   DEMO_PASSWORD='una-password-tua1' python3 docs/demo/seed-demo.py --foto cartella/con/4/foto
   ```
   Lo script sveglia il server, crea Vale, Marco e Giulia e stampa le email.
2. **PC:** entra come Vale. **Telefono:** entra come Marco e apri già la chat di Lisbona.
3. **5 minuti prima** apri il sito sul PC e ricarica una volta: il server gratuito di Render impiega ~35 s a svegliarsi (o attiva Render Starter per quella settimana).
4. Zoom del browser al 125 %: in sala si legge meglio.
5. **Piano B:** un video della demo registrato il giorno prima (Cmd+Shift+5 sul Mac) e le schermate del README.

## Se qualcosa va storto

| Problema | Cosa fai |
|---|---|
| Il server dorme | Parli dell'idea (0:00–0:20) mentre si sveglia: hai già aperto la pagina 5 minuti prima |
| Il messaggio dal telefono non arriva | «Il canale si sta ricollegando»: ricarica la chat sul PC, il messaggio è salvato |
| Rete assente | Passi al video |
