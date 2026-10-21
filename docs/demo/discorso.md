# SplitTrip — discorso per la presentazione (3 minuti)

Presentazione del 28 ottobre 2026. Circa 430 parole, ritmo tranquillo. Tra parentesi quadre il tempo e cosa mostrare a schermo.

---

**[0:00 – 0:20] Il problema** · *a schermo: Home*

> Chi è andato in vacanza con un gruppo di amici conosce il momento peggiore del viaggio: l'ultima sera, con lo scontrino del ristorante in mano e il telefono con la calcolatrice. Chi ha pagato il taxi? E quella cena in yen, quanto fa in euro? SplitTrip nasce per togliere quell'attrito: spese divise, conti chiari, e il viaggio torna a essere il viaggio.

**[0:20 – 0:50] Ada crea il viaggio** · *a schermo: nuovo viaggio, QR dell'invito*

> Ada organizza un viaggio a Lisbona. Sceglie la destinazione dall'elenco, e con quella arrivano meteo, mappa e la stagione dello sfondo. Per invitare il gruppo basta il QR: chi lo inquadra entra nel viaggio. *(Se il tempo lo permette: «potete provarlo anche voi, adesso».)*

**[0:50 – 1:30] Le spese** · *a schermo: nuova spesa, «conta per», valuta*

> Le spese si dividono come succede davvero: in parti uguali, per chi c'era solo due notti, o con chi «conta per due», come una coppia. E se a Tokyo Bruno paga il sushi in yen, scrive l'importo dello scontrino: il cambio della Banca Centrale Europea arriva da solo e i conti restano in euro, al centesimo.

**[1:30 – 2:00] Saldare, offline, la fine** · *a schermo: Saldi → «Salda», avviso offline, riepilogo*

> In «Saldi» SplitTrip calcola il minor numero di rimborsi possibile: un tocco su «Salda» e il debito si chiude. Funziona anche senza rete, in sola lettura: in aereo i conti si vedono lo stesso. E a fine viaggio arriva il riepilogo: prima si gioca a indovinare quanto avete speso, poi i numeri, i badge e un'immagine da condividere nelle storie.

**[2:00 – 2:50] Come è fatto** · *a schermo: GitHub col badge verde, Actions, board Trello*

> Dietro c'è un metodo: prima la specifica, poi il piano, poi il codice, scritto partendo dai test. Ogni scelta è registrata con le alternative scartate: sono settanta decisioni. Il progetto ha più di seicento test, tra backend, frontend e un giro completo in un browser vero, con due persone che si registrano, dividono una cena e saldano. A ogni push la CI li fa girare tutti, e alla prima esecuzione ha trovato due errori sui soldi che nessuno aveva notato usando l'app. L'interfaccia è verificata per l'accessibilità, segue le impostazioni del telefono, e i testi sono scritti senza dare per scontato il genere di chi legge.

**[2:50 – 3:00] Chiusura** · *a schermo: Home o l'immagine per le storie del riepilogo*

> SplitTrip: vacanze in compagnia, conti chiari. Grazie.

---

## Da ricontrollare prima del 28

- **Numeri:** «settanta decisioni» (D-01…D-70 in `docs/decisioni.md`) e «più di seicento test» (251 backend + 367 frontend + il giro e2e al 21 ottobre). Se cambiano, aggiornare qui.
- **QR dal vivo:** con proiettore e poche persone in sala, farle entrare nel viaggio dal loro telefono è il momento più forte. Se si preferisce non rischiare, togliere la frase tra parentesi.
- **Server:** svegliare Render qualche minuto prima (`curl https://splittrip-api.onrender.com/actuator/health`), i dati di esempio caricati la mattina.
