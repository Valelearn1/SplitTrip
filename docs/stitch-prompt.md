# Prompt per Stitch — schermate SplitTrip v1

Da incollare in Stitch (una schermata per volta, oppure tutto insieme come progetto). Le schermate servono come riferimento visivo prima dell'implementazione delle pagine (task FE-02 … FE-07).

## Prompt di progetto

```
Design a mobile-first web app called "SplitTrip" for groups of friends on vacation: they plan a trip together, log shared expenses, and always know who owes whom. Tone: warm, friendly, trustworthy — a travel companion, not a banking app. Avoid generic fintech look.

Visual direction: light background, one teal/green accent for primary actions, a warm coral used only for "you owe" amounts, calm green for "you are owed". Never rely on color alone: amounts that are owed also carry a minus sign and the label "devi dare", amounts to receive a plus sign and "devi ricevere" (color-blind friendly). Rounded cards (12px), generous white space, large readable amounts, bottom tab bar on mobile. Typography: a friendly geometric sans for headings, a highly legible sans for body and numbers (tabular figures for money). Minimum touch target 44px, visible focus rings, WCAG AA contrast. Italian UI copy.

Screens (mobile 390px wide; also provide a desktop variant for the trip dashboard with a left sidebar):

1. Login / Registrazione — minimal: logo, email, password, display name (registration only), primary button, link to switch. Error state under fields.

2. I miei viaggi — list of trip cards: destination as title, date range, status badge (In pianificazione / In corso / Chiuso), member avatars stack, "il tuo saldo" small line. Floating "+" button bottom-right. Empty state with illustration and "Crea il tuo primo viaggio".

3. Nuovo viaggio — form: nome, destinazione, date (inizio/fine), valuta (default EUR). Primary button "Crea viaggio".

4. Entra con codice — card preview of the trip (name, destination, dates, "3 partecipanti") and a big "Entra" button; invite code shown in monospace.

5. Dashboard del viaggio — header with destination, dates, status; a prominent "Il tuo saldo" card (+50,00 € in green "devi ricevere", or −35,00 € in coral "devi dare"); total spent; last 3 expenses; members row with invite code and a "Condividi codice" button; bottom tab bar: Panoramica · Spese · Saldi (+ Liste · Foto greyed as "presto").

6. Spese — list grouped by day, each row: category icon, description, "pagato da Marco", amount; filter chips by category; floating "+" button; organizer sees a small "Cestino" link.

7. Nuova spesa — fast-entry form: huge amount input at top, description, category chips, date, "Chi ha pagato" (avatar picker, default me), "Diviso tra" with all members checked by default and a toggle "Parti uguali / Importi personalizzati"; in custom mode a per-person amount field with a live "resta da assegnare: 0,00 €" indicator; primary button "Salva".

8. Saldi — per-person balance list with bars; then "Come pareggiare" section listing suggested transfers "Giulia → Marco 15,00 €" each with a "Salda" button; small link "Rimborsi registrati".

9. Registra rimborso — prefilled from a suggested transfer: from, to, amount, date, note; "Conferma".

10. Impostazioni viaggio (organizer) — edit name/dates, change status with a 3-step stepper, regenerate invite code, member list with remove, danger zone "Elimina viaggio".

Also show: empty states for expenses and balances; a thin top banner "Il server si sta svegliando…" for cold starts.
```

## Note per l'uso

- Partire dalla schermata 5 (dashboard) e 7 (nuova spesa): sono quelle che definiscono il carattere dell'app.
- Chiedere a Stitch una variante desktop solo per 5, 6 e 8.
- Esportare i colori e le font scelte: verranno trasformati in token CSS nel task FE-07 con Impeccable.
- L'accessibilità (segno + testo oltre al colore, contrasto AA, target 44 px, focus visibile) è già nel prompt: da discutere e confermare prima di FE-07.
