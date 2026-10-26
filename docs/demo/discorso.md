# SplitTrip — discorso per la presentazione (3 minuti)

Presentazione del 28 ottobre 2026. Circa 440 parole, ritmo tranquillo. Tra parentesi quadre il tempo e cosa mostrare a schermo. I nomi e i numeri sono quelli del viaggio **London 2026** già caricato sul sito.

---

**[0:00 – 0:20] Il problema** · *a schermo: la presentazione, «Vacanze in compagnia, conti chiari»*

> Chi è andato in vacanza con un gruppo di amici conosce il momento peggiore del viaggio: l'ultima sera, con gli scontrini in mano e la calcolatrice del telefono. Chi ha pagato l'hotel? E quella cena in sterline, quanto fa in euro? SplitTrip nasce per togliere quell'attrito: spese divise, conti chiari, e il viaggio torna a essere il viaggio.

**[0:20 – 0:50] Il viaggio e il gruppo** · *a schermo: Home con London 2026 in evidenza, poi la panoramica con i compagni di viaggio e il QR*

> Questo è London 2026: otto giorni a Londra, siamo al terzo. Lo organizzo io, con Tina, Fede e Luca. Luca non ha l'app, ed è nel viaggio lo stesso: l'ho aggiunto per nome e i conti lo contano come gli altri. Per invitare il gruppo basta il QR: chi lo inquadra entra nel viaggio. *(«Potete provarlo anche voi, adesso».)* Scelta la destinazione dall'elenco, arrivano da soli il meteo, la mappa e la stagione dello sfondo: queste foglie sono l'autunno.

**[0:50 – 1:30] Le spese** · *a schermo: Spese → «Hotel», poi Nuova spesa con la valuta*

> Le spese si dividono come succede davvero: in parti uguali, per presenza, cioè per chi c'era solo due notti, o con gli importi scritti a mano. E l'hotel, pagato in sterline? Si scrive l'importo dello scontrino, 400 sterline: il cambio della Banca Centrale Europea arriva da solo e la spesa vale 476 euro e 3 centesimi, la mia quota 238 e 2. I conti restano in euro, al centesimo.

**[1:30 – 2:00] Prima, durante e dopo** · *a schermo: Saldi → «Regola conti», Liste, Consigli per Londra*

> In Saldi SplitTrip calcola il minor numero di rimborsi possibile: un tocco e il debito si chiude. Prima di partire ci sono le liste del gruppo: «Cose da prenotare», il Parlamento a Tina e il London Eye a me, e un bagaglio a mano suggerito dall'intelligenza artificiale in base al meteo, undici voci. Durante, le foto finiscono sulla mappa e la chat è nel viaggio. Funziona anche senza rete, in sola lettura: in metropolitana i conti si vedono lo stesso. E a fine viaggio arriva «Il vostro viaggio in numeri»: si indovina il totale, poi i numeri, i badge e un'immagine da condividere.

**[2:00 – 2:50] Come è fatto** · *a schermo: GitHub col badge verde, Actions, board Trello*

> Dietro c'è un metodo: prima la specifica, poi il piano, poi il codice, scritto partendo dai test. Ogni scelta è registrata con le alternative scartate: sono settantacinque decisioni. Il progetto ha più di seicento test, tra backend, frontend e un giro completo in un browser vero, con due persone che si registrano, entrano col QR, dividono una cena e saldano. A ogni push la CI li fa girare tutti, e alla prima esecuzione ha trovato due errori sui soldi che nessuno aveva notato usando l'app. L'interfaccia è verificata per l'accessibilità, segue le impostazioni del telefono, i testi sono scritti senza dare per scontato il genere di chi legge, e chi si registra accetta i termini e sa dove finiscono i suoi dati.

**[2:50 – 3:00] Chiusura** · *a schermo: la Home con il Big Ben*

> SplitTrip: vacanze in compagnia, conti chiari. Grazie.

---

## Da ricontrollare prima del 28

- **Numeri:** «settantacinque decisioni» (D-01…D-75 in `docs/decisioni.md`) e «più di seicento test» (258 backend + 383 frontend + il giro e2e al 25 ottobre). Se cambiano, aggiornare qui.
- **Il viaggio:** London 2026 deve restare «In corso» (24–31 ottobre: il 28 è il giorno 5, non il 3: dire «siamo al quinto giorno» o leggere il numero a schermo). Hotel 400 GBP = 476,03 €, quota 238,02 €: se aggiungi altre spese cambiano, rileggerli dallo schermo.
- **QR dal vivo:** chi inquadra entra nel viaggio dal proprio telefono dopo una registrazione di un minuto. Tenere la pagina del QR pronta e dire che si può fare anche dopo.
- **Server:** svegliare Render qualche minuto prima (`curl https://splittrip-api.onrender.com/actuator/health`); aprire il sito dal telefono una volta prima di salire.
