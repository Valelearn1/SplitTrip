---
name: SplitTrip
description: Il taccuino di viaggio del gruppo, dove si legge subito chi deve cosa a chi.
colors:
  bg: "#f8f9ff"
  surface: "#ffffff"
  surface-1: "#eff4ff"
  surface-2: "#e7eefd"
  surface-3: "#dbe3f1"
  line: "#dbe3f1"
  ink: "#141c26"
  ink-2: "#3f4a58"
  ink-3: "#5f6b7a"
  accent: "#2347b8"
  accent-2: "#1c3a99"
  accent-soft: "#c9d5ff"
  accent-tint: "#e3e9ff"
  negative: "#a3305e"
  negative-2: "#d6457f"
  negative-soft: "#f6c9db"
  negative-tint: "#fbe7ef"
  amber: "#7a4f00"
  amber-tint: "#fff3d6"
  cat-food: "#8e2a63"
  cat-food-tint: "#fbe9f3"
  cat-transport: "#2b5fb3"
  cat-transport-tint: "#e9f1ff"
  cat-lodging: "#5b3fa3"
  cat-lodging-tint: "#efe9ff"
typography:
  display:
    fontFamily: "'DM Sans', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
    fontSize: "2.5rem"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.03em"
    fontFeature: "tnum"
  headline:
    fontFamily: "'DM Sans', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 700
    lineHeight: 1.45
    letterSpacing: "-0.01em"
  amount:
    fontFamily: "'DM Sans', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 800
    letterSpacing: "-0.02em"
    fontFeature: "tnum"
  title:
    fontFamily: "'DM Sans', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    letterSpacing: "-0.01em"
  body:
    fontFamily: "'DM Sans', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: "'DM Sans', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
  meta:
    fontFamily: "'DM Sans', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 600
  code:
    fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace"
    fontSize: "1.125rem"
    fontWeight: 600
    letterSpacing: "2px"
rounded:
  radius-sm: "10px"
  control: "12px"
  radius: "16px"
  radius-pill: "999px"
spacing:
  space-1: "4px"
  space-2: "8px"
  space-3: "12px"
  space-4: "16px"
  space-5: "24px"
  space-6: "32px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.surface}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "0 20px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.accent-2}"
  button-soft:
    backgroundColor: "{colors.accent-tint}"
    textColor: "{colors.accent}"
    rounded: "{rounded.control}"
    padding: "0 20px"
    height: "48px"
  button-soft-hover:
    backgroundColor: "{colors.accent-soft}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0 20px"
    height: "48px"
  button-secondary-hover:
    backgroundColor: "{colors.surface-1}"
  button-danger:
    backgroundColor: "{colors.negative}"
    textColor: "{colors.surface}"
    rounded: "{rounded.control}"
    padding: "0 20px"
    height: "48px"
  button-small:
    padding: "0 14px"
    height: "40px"
  input:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "10px 14px"
    height: "48px"
  input-focus:
    backgroundColor: "{colors.surface}"
  input-invalid:
    backgroundColor: "{colors.negative-tint}"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.radius}"
    padding: "{spacing.space-4}"
  balance-pill-positive:
    backgroundColor: "{colors.accent-tint}"
    textColor: "{colors.accent}"
    typography: "{typography.label}"
    rounded: "{rounded.radius-pill}"
    padding: "4px 10px 4px 8px"
  balance-pill-negative:
    backgroundColor: "{colors.negative-tint}"
    textColor: "{colors.negative}"
    typography: "{typography.label}"
    rounded: "{rounded.radius-pill}"
    padding: "4px 10px 4px 8px"
  balance-pill-neutral:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink-2}"
    typography: "{typography.label}"
    rounded: "{rounded.radius-pill}"
    padding: "4px 10px 4px 8px"
  status-badge-planning:
    backgroundColor: "{colors.amber-tint}"
    textColor: "{colors.amber}"
    typography: "{typography.meta}"
    rounded: "{rounded.radius-pill}"
    padding: "4px 10px"
  status-badge-ongoing:
    backgroundColor: "{colors.accent-tint}"
    textColor: "{colors.accent}"
    typography: "{typography.meta}"
    rounded: "{rounded.radius-pill}"
    padding: "4px 10px"
  status-badge-closed:
    backgroundColor: "{colors.surface-3}"
    textColor: "{colors.ink-2}"
    typography: "{typography.meta}"
    rounded: "{rounded.radius-pill}"
    padding: "4px 10px"
  chip:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.radius-pill}"
    padding: "0 14px"
    height: "40px"
  chip-active:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.surface}"
  avatar:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink-2}"
    typography: "{typography.label}"
    rounded: "{rounded.radius-pill}"
    size: "40px"
  avatar-me:
    backgroundColor: "{colors.accent-tint}"
    textColor: "{colors.accent}"
  category-icon:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.accent}"
    rounded: "{rounded.radius-pill}"
    size: "44px"
  tab-active:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.accent}"
    rounded: "{rounded.radius-sm}"
    height: "44px"
  tab-active-mobile:
    backgroundColor: "{colors.accent-tint}"
    textColor: "{colors.accent}"
    height: "52px"
  fab:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.surface}"
    rounded: "{rounded.radius-pill}"
    size: "60px"
---

# Design System: SplitTrip

## Overview

**Creative North Star: "Il taccuino di viaggio del gruppo"**

SplitTrip è uno strumento da usare in piedi, con una mano, al ristorante o in taxi: il sistema visivo esiste per rendere leggibile in un colpo d'occhio una sola informazione, il saldo personale. Fondo azzurro-latte, superfici a strati che salgono dal bianco al grigio-azzurro, card bianche morbide (raggio 16 px) con un'ombra appena percepibile. Un solo accento d'azione, il blu cobalto, che è anche il colore del «devi ricevere»; il lampone compare solo quando qualcuno deve dare (D-58). Dietro tutto, l'illustrazione della stagione del viaggio aperto; card e barre sono vetro bianco quasi opaco sopra il disegno.

La densità è da app mobile: righe da 44 px, bottoni da 48 px, importi grandi in DM Sans extrabold con cifre tabulari, ogni importo con segno accompagnato da una pillola freccia + testo. Il segno ricorrente sono i cerchi con le iniziali dei partecipanti: tornano nel header, nella dashboard, nel form spesa come selettore del pagante, nei saldi e nei membri. Le icone sono Material Symbols Outlined (peso 500), mai glifi o emoji come icone.

Rifiuti confermati: non deve sembrare una banca o una fintech (niente blu istituzionale scuro e piatto, niente tabelle grigie di transazioni con un accento solo) e non deve risultare minimal e anonimo. Il cobalto è vivo e sta su sfondi illustrati e colorati, mai su grigio. Tema chiaro e scuro blu notte, a scelta sull'account (D-57); il chiaro resta il riferimento per l'uso all'aperto.

**Key Characteristics:**
- Fondo `bg` azzurro-latte, superfici a strati `surface-1` → `surface-3`, card bianche raggio 16 px.
- Cobalto = azione e «devi ricevere»; lampone = solo «devi dare» (ed errori).
- Sfondo illustrato per stagione (D-58), card in vetro `surface-glass` con sfocatura.
- DM Sans ovunque; importi 40 px / 24 px extrabold con cifre tabulari.
- Pillola di saldo freccia + testo incollata a ogni importo con segno.
- Cerchi con le iniziali come segno dei partecipanti; anello cobalto per «tu».
- Tab bar in basso su mobile, segmentata in alto su desktop; FAB «+» nelle liste.
- Accessibilità D-24 come vincolo visivo, non come rifinitura.

## Colors

Una palette fredda e luminosa con un accento cobalto deciso e un lampone riservato al debito (D-58, al posto di teal e corallo). I nomi dei token dicono il ruolo, non la tinta: `accent` e `negative`.

### Primary
- **Cobalto Rotta** (`accent`): bottoni primari, link, chip e tab attivi, FAB, testo e importi positivi, «devi ricevere», icone in `info` e negli stati vuoti, cursore e `accent-color`. È il colore di testo positivo: passa AA su `surface`, `bg`, `accent-tint` e sul vetro. Scuro: `#9db4ff`.
- **Cobalto Notte** (`accent-2`): hover dei bottoni primari e del FAB (passa AA col bianco); riempimento delle barre di saldo positive.
- **Cobalto Nuvola** (`accent-soft`): selezione del testo, hover del bottone soft.
- **Cobalto Velo** (`accent-tint`): fondo del bottone soft, della pillola positiva, del badge «In corso», dell'avatar «tu», del tab attivo su mobile e dei cerchi icona negli stati vuoti.

### Secondary
- **Lampone Scuro** (`negative`): unico lampone ammesso per il testo. Importi negativi, pillola «devi dare», errori di campo e di form, bordo dei campi non validi, bottone di conferma distruttiva, contatore delle notifiche. Scuro: `#ff9cc4`.
- **Lampone Vivo** (`negative-2`): riempimento delle barre di saldo negative, hover del bottone distruttivo nel tema scuro. Mai per il testo nel tema chiaro.
- **Lampone Velo** (`negative-tint`): fondo della pillola negativa e dei campi non validi.
- **Lampone Rosa** (`negative-soft`): definito nei token, oggi non usato nel build.

### Tertiary
- **Ambra Bussola** (`amber`) su **Ambra Velo** (`amber-tint`): stato «In pianificazione», banner di risveglio del server, categoria «Attività».
- **Categorie di spesa**: cibo (`cat-food` su `cat-food-tint`, prugna), trasporti (`cat-transport` su `cat-transport-tint`, blu), alloggio (`cat-lodging` su `cat-lodging-tint`, viola), attività (ambra), altro (`ink-2` su `surface-2`). Nel build questi valori sono letterali nelle classi `.cat-*`, non variabili CSS.

### Neutral
- **Azzurro Latte** (`bg`): fondo della pagina, colore interno dell'anello di focus.
- **Bianco Carta** (`surface`): modale, campi a fuoco, tab attivo su desktop, popover.
- **Vetro** (`surface-glass`, `rgba(255, 255, 255, 0.9)`; scuro `rgba(24, 33, 45, 0.94)`): card, header e tab bar mobile sopra l'illustrazione, con `backdrop-filter: blur(10px)`. Il contrast test lo mescola col colore del disegno più sfavorevole e pretende l'AA per `ink`, `ink-3`, `accent` e `negative`.
- **Azzurro Nebbia** (`surface-1`): fondo dei campi, riquadri tinti dentro le card (`kv`, `info`, `invite`), cerchio icona di default, hover dei secondari e dei chip, divisori fra righe.
- **Azzurro Pietra** (`surface-2`): avatar degli altri partecipanti, pillola neutra, badge semplice, fondo delle barre e della barra dei tab su desktop.
- **Azzurro Ardesia** (`surface-3`): bordi di campi, chip e bottoni secondari; badge «Chiuso»; binario dello spinner.
- **Linea** (`line`): bordi di card, header e tab bar mobile.
- **Inchiostro** (`ink`): testo principale. **Inchiostro 2** (`ink-2`): etichette dei campi, testo dei chip e dei badge. **Inchiostro 3** (`ink-3`): testo secondario (`.muted`), meta, `h3`, placeholder.

### Named Rules
**The Raspberry Means Owing Rule.** Il lampone significa solo «devi dare» (e, per estensione, errore e azione distruttiva). Nessuna categoria o stato neutro usa la famiglia del lampone; nelle illustrazioni stagionali i rosa (ciliegi, ombrellone) sono pastello e stanno dietro al vetro, mai accanto a un importo.

**The Never Color Alone Rule.** Ogni importo con segno porta il segno (`+` / `−`) e una pillola con freccia e testo («↑ Devi ricevere», «↓ Devi dare», «✓ Sei in pari»); i badge di stato hanno sempre il testo; gli errori hanno icona e testo. Il colore conferma, non informa da solo.

**The Dark Raspberry For Text Rule.** Per il testo si usano solo `accent` e `negative` (contrasto WCAG AA). `negative-2` vive nelle barre e nei riempimenti, mai come colore del testo nel tema chiaro.

**The Tokens Only Rule.** Ogni colore dell'interfaccia passa dai token di `index.css`, che hanno la versione scura: niente esadecimali nei componenti. Eccezioni dichiarate, perché non cambiano col tema: le illustrazioni stagionali (SVG generati), il logo mappamondo e la favicon, i pastelli della ruota con il loro inchiostro, la copertina cobalto del riepilogo e l'immagine per le storie (un PNG, fuori dall'app). Dove c'è testo sopra, il contrasto è verificato da un test (vetro sopra il disegno, pastelli della ruota) oppure scelto con largo margine (bianco su cobalto pieno e sul fondo scuro dell'immagine).

## Typography

**Display Font:** DM Sans (con system-ui, -apple-system, Segoe UI, Roboto, sans-serif)
**Body Font:** DM Sans (stesso stack)
**Label/Mono Font:** ui-monospace, SF Mono, Menlo, solo per il codice invito

**Character:** Un'unica grotesk geometrica e cordiale, usata in tutti i pesi da 400 a 800; la gerarchia nasce dal peso e dalla dimensione, non da un secondo carattere. I numeri sui soldi sono sempre tabulari, così le colonne di importi restano allineate.

### Hierarchy
- **Display** (800, 2.5rem, 1.1, -0.03em, tabulari): il saldo personale nella dashboard e nella pagina saldi; anche l'importo nel form nuova spesa (`amount-input`, 2.5rem/800 centrato, campo alto 72 px).
- **Headline** (700, 1.75rem, -0.01em; 1.5rem sotto i 720 px): `h1`, nome del viaggio e titolo di pagina. `text-wrap: balance`.
- **Amount** (800, 1.5rem, -0.02em, tabulari): saldo nell'intestazione del viaggio e importi dei trasferimenti suggeriti.
- **Title** (700, 1.125rem, -0.01em): `h2`, titoli delle card, degli stati vuoti e delle modali; 1.25rem nelle card viaggio. Il marchio usa 1.125rem/800/-0.02em in cobalto.
- **Body** (400, 1rem, 1.45): testo corrente; i campi sono sempre a 1rem (16 px) per evitare lo zoom su iOS. Importi in riga: 700, tabulari.
- **Label** (600, 0.875rem): etichette dei campi (`ink-2`), etichette dei valori come «Il tuo saldo» (`ink-3`), pillole di saldo, `h3` (`ink-3`).
- **Meta** (600 o 400, 0.8125rem): badge di stato, nomi sotto gli avatar, testo secondario nelle colonne destre delle righe. Testo dei tab su mobile: 0.6875rem/600.
- **Codice** (mono 600, 1.125rem, spaziatura 2px): solo il codice invito, in un riquadro bianco con bordo tratteggiato.

### Named Rules
**The Tabular Money Rule.** Ogni importo usa `font-variant-numeric: tabular-nums`, peso 700 in riga e 800 quando è protagonista, e non va mai a capo.

**The One Family Rule.** DM Sans ovunque; il monospace è riservato al codice invito. Nessun carattere di sistema come display.

## Layout

Mobile-first, una colonna fino a 719 px; da 720 px le card della dashboard e dei saldi si dispongono su una griglia a due colonne (`grid-2`, gap 12 px) con la card del saldo a tutta larghezza (`span-2`). Il contenuto principale ha larghezza massima 1040 px, centrato, con padding 16 px ai lati e 32 px in fondo; le pagine di accesso si restringono a 420 px. **Larghezze di prova:** 430 px (riferimento indicato dal docente, iPhone grandi), 390 e 360 px, con nomi lunghi; le colonne `.stack` sono `minmax(0, 1fr)`, così un contenuto lungo va a capo invece di allargare la pagina.

Ritmo di spaziatura su scala 4/8/12/16/24/32 (`space-1` → `space-6`): 12 px fra card e fra elementi di una riga, 16 px di padding nelle card e sotto le intestazioni di pagina, 24 px nelle modali, 32 px negli stati vuoti. Le righe di lista hanno padding verticale 10 px e un divisore `surface-1`; le colonne destre delle righe sono allineate a destra e non si stringono.

Navigazione del viaggio: sopra i 720 px una barra segmentata in alto (fondo `surface-2`, raggio 14 px, tab attivo bianco con ombra card); sotto i 720 px la stessa barra diventa una tab bar fissa in basso, bianca, con icona sopra l'etichetta, rispetto della safe area e 164 px di padding inferiore sul contenuto. Il FAB da 60 px sta in basso a destra (20/24 px dai bordi; 84 px dal fondo quando c'è la tab bar). L'header è sticky, bianco, con bordo inferiore.

**The Balance First Rule.** Su ogni schermata del viaggio il saldo personale con la sua pillola è leggibile senza scorrere: nella card del saldo in dashboard e saldi, e nell'intestazione del viaggio nelle altre schede.

## Elevation & Depth

Profondità ibrida: soprattutto tonale (fondo azzurro-latte, card bianche, riquadri tinti `surface-1` dentro le card), con un'ombra card morbida e quasi impercettibile che stacca le card dal fondo. Le ombre più forti sono riservate agli elementi che galleggiano davvero: FAB e modale.

### Shadow Vocabulary
- **Card a riposo** (`box-shadow: 0 1px 2px rgba(20, 28, 38, 0.04), 0 10px 24px -14px rgba(20, 28, 38, 0.22)`, token `--shadow-card`): card e tab attivo su desktop.
- **Card viaggio in hover** (`box-shadow: 0 2px 4px rgba(20, 28, 38, 0.05), 0 18px 32px -16px rgba(20, 28, 38, 0.3)`, con `translateY(-2px)`): solo le card cliccabili della lista viaggi.
- **Galleggiante cobalto** (`box-shadow: 0 6px 18px -4px rgba(35, 71, 184, 0.45)`, token `--shadow-float`): solo il FAB.
- **Modale** (`box-shadow: 0 24px 48px -12px rgba(20, 28, 38, 0.35)`, backdrop `rgba(20, 28, 38, 0.45)`).
- **Anello di focus** (`box-shadow: 0 0 0 3px var(--bg), 0 0 0 6px var(--accent)`, token `--focus`): doppio anello, fondo poi cobalto.

### Named Rules
**The Tinted Ink Shadow Rule.** Le ombre sono sempre dell'inchiostro `#141c26` a bassa opacità (o del cobalto per il FAB), morbide e con spread negativo; mai nere pure, mai ombre dure sfalsate.

## Shapes

Forme morbide e amichevoli. Card e modale a 16 px (`radius`); bottoni, campi, riquadri tinti e codice invito a 12 px (`control`, valore letterale ripetuto nel CSS, non variabile); tab e campi quota a 10 px (`radius-sm`); barra segmentata a 14 px. Tutto ciò che rappresenta una persona, una categoria o uno stato è un cerchio o una pillola: avatar, cerchi categoria (44 px), FAB, badge, pillole di saldo, chip. Il logo di accesso è un quadrato morbido da 72 px con raggio 22 px. Le barre di saldo sono alte 8 px con raggio 4 px. Bordi da 1 px nei colori `line` / `surface-3`; l'unico bordo tratteggiato è quello del codice invito.

## Components

### Buttons
Pieni, alti e decisi: si premono con il pollice.
- **Shape:** angoli morbidi (12 px), altezza minima 48 px, padding orizzontale 20 px, peso 600, icona + testo con gap 8 px.
- **Primary:** fondo `accent`, testo bianco. Una sola azione primaria per contesto («Nuova spesa», «Salva», «Salda»).
- **Soft:** fondo `accent-tint`, testo `accent`; azione secondaria affermativa («Regola conti», «Condividi», «Ho un codice»).
- **Secondary:** fondo bianco, bordo `surface-3`, testo `ink` («Esci», «Annulla»).
- **Danger:** fondo `negative`, testo bianco, hover più scuro; solo nelle conferme distruttive.
- **Small:** 40 px di altezza, padding 14 px, 0.9375rem.
- **Hover / Focus / Active:** transizione 150 ms su fondo, trasformazione e ombra con `cubic-bezier(0.2, 0.8, 0.2, 1)`; `:active` scende di 1 px; focus con l'anello doppio; disabilitato a opacità 0.55. In caricamento il testo diventa «Attendi…».

### Chips
- **Style:** pillola alta 40 px, fondo bianco, bordo `surface-3`, testo `ink-2` 0.9375rem/500, icona 18 px opzionale. Avvolgono un radio nascosto (categorie nel form spesa), in una fila scorrevole su mobile.
- **State:** hover `surface-1`; selezionato fondo e bordo `accent`, testo bianco; il focus del radio interno mostra l'anello sul chip.
- **Scelta in linea (v1.5):** gli stessi chip, senza icona, fanno da gruppo di radio con `legend` per scelte secondarie dentro una sezione (Notti / Giorni nella divisione per presenza). Il nome accessibile è il testo del chip: le icone sono `aria-hidden`.

### Cards / Containers
- **Corner Style:** 16 px.
- **Background:** `surface` su fondo `bg`; dentro, riquadri tinti `surface-1` a 12 px per riepiloghi (`kv`), avvisi (`info`, icona cobalto) e codice invito.
- **Shadow Strategy:** ombra card a riposo (vedi Elevation & Depth).
- **Border:** 1 px `line`.
- **Internal Padding:** 16 px; i titoli `h2` hanno 12 px sotto.

### Inputs / Fields
- **Style:** fondo `surface-1`, bordo 1 px `surface-3`, raggio 12 px, altezza minima 48 px, testo 16 px, cursore cobalto. Etichetta sopra a 0.875rem/600 `ink-2`, gap 6 px.
- **Focus:** fondo bianco, bordo `accent`, più l'anello di focus globale.
- **Error:** bordo `negative` e fondo `negative-tint`; messaggio sotto con icona e testo `negative` 0.875rem/500.
- **Importo:** campo gigante 2.5rem/800 centrato, alto 72 px, con il simbolo della valuta in cobalto a destra.
- **Checkbox:** 22 px, riga cliccabile alta almeno 44 px, colore da `accent-color` cobalto.
- **«Conta per» (v3, D-44; tolto il 25 ottobre, D-75):** non c'è più nell'interfaccia. Una spesa per peso salvata prima si apre in Parti uguali con il riquadro `info` «Marco conta per 2: 60,00 € invece di 45,00 €» e il link «Ogni persona conta per 1» per azzerare; non ci sono più chip né campo numerico.
- **Numero in riga con anteprima (v1.5):** nelle righe «Diviso tra» per Presenza, campo quota stretto (`weight-input`, 76 px) allineato a destra con l'anteprima della quota in euro sotto, `muted` 0.8125rem. Il campo è stretto apposta: il nome della persona non deve andare a capo. `aria-label` «Notti di …» / «Giorni di …».
- **Nota sotto un campo (v1.5):** `.hint`, 0.875rem `muted`, attaccata al campo sopra (margine negativo) e staccata 16 px dal successivo. Spiega il significato del valore (es. «1 = una persona, 2 = una coppia…»), non ripete l'etichetta.

### Navigation
- **Header:** bianco, sticky, marchio cobalto con il logo mappamondo (D-58: sfera blu, Europa e Africa verdi, riflesso di luce; colori fissi, id unici per istanza) a sinistra; a destra campanella, avatar «tu» (link al profilo), nome (nascosto su mobile) ed «Esci» secondario piccolo.
- **Campanella (v2):** bottone rotondo 44 px con icona 24 px `ink-2`, hover `surface-1`; il contatore dei non letti è una pillola `negative` 18 px con numero bianco 0.6875rem/700 in alto a destra, e il nome accessibile dice il numero a parole («Notifiche, 2 non lette»).
- **Tab del viaggio:** desktop, barra segmentata `surface-2` con tab alti 44 px, 0.9375rem/600 `ink-2`, attivo bianco con testo cobalto e ombra card. Mobile, tab bar fissa in basso, icona 24 px sopra etichetta 0.6875rem, tab alti 52 px, attivo su `accent-tint`. Cinque tab (v2): Panoramica, Spese, Saldi, Liste, Foto; le impostazioni del viaggio stanno in un bottone ingranaggio 44 px nell'intestazione (`aria-label` «Impostazioni del viaggio»), non in una sesta tab. Accanto, a sinistra, il **bottone Chat** (v3, D-42): stesso bottone 44 px con icona `chat_bubble` e il numero dei non letti nella pillola `negative` della campanella; `aria-label` «Chat, 3 messaggi non letti». I due bottoni stanno affiancati (`head-actions`), anche su mobile.
- **FAB:** cerchio cobalto da 60 px con «+» da 30 px e ombra galleggiante; hover `accent-2` e scala 1.04. Vive nelle liste (viaggi, spese, foto), non nella dashboard. Nella pagina Foto l'icona è la fotocamera con «+».

### Pillola di saldo (signature)
Pillola (padding 4/10/4/8 px, 0.875rem/600) con freccia Material Symbols da 18 px e testo: positiva `accent` su `accent-tint` con freccia in su, negativa `negative` su `negative-tint` con freccia in giù, in pari `ink-2` su `surface-2` con spunta. Sta sempre accanto a un importo con segno; in terza persona dice «Deve ricevere / Deve dare / In pari».

### Cerchi delle iniziali (signature)
Avatar circolari da 40 px (32 px piccoli, 56 px grandi) con due iniziali maiuscole 700. Gli altri partecipanti su `surface-2` / `ink-2`; «tu» su `accent-tint` / `accent` con doppio anello bianco + cobalto. Come selettore del pagante, la persona scelta diventa piena di cobalto con testo bianco e nome in cobalto 700.
Chi partecipa senza account (v1.5) ha lo stesso cerchio: la differenza è detta a parole, con «senza account» in `small` sotto il nome, mai con un colore o un'icona sola (D-24). Le azioni di riga sulle persone (`row-actions`) vanno a capo allineate a destra invece di uscire dallo schermo.

### Cerchi categoria e badge di stato
Cerchi da 44 px con icona Material Symbols da 22 px nel colore della categoria su tinta della stessa famiglia. Badge di stato a pillola, 0.8125rem/600, con un pallino 7 px nel colore del testo e la parola dello stato.

### Barre di saldo
Binario `surface-2` alto 8 px, rientrato di 52 px per allinearsi al testo dopo l'avatar; riempimento `accent-2` o `negative-2` scalato in proporzione al saldo massimo, transizione 300 ms.

### Stati vuoti, spinner, banner
Stato vuoto centrato con icona da 40 px in un cerchio `accent-tint` da 72 px, titolo `h2` e azione. Spinner: anello 18 px `surface-3` con arco cobalto e testo `ink-3`. Banner di risveglio del server su `amber-tint` con testo `amber`.

### Card lista (v2)
Una `card` per lista: titolo `h3` 1.0625rem/700 `ink` con icona cobalto (valigia per «Valigia», spunta per le liste generali), contatore «2/5 fatte» a pillola e azioni piccole (rinomina, elimina) a destra. Ogni voce è una riga con checkbox `flex:none` e testo; la voce fatta è barrata in `ink-3`. Le azioni della voce (select dell'assegnatario `assign-select`, 40 px, raggio 10 px, fondo `surface-1`, e cestino) su mobile vanno sulla riga sotto, allineate a destra: il testo ha tutta la larghezza. L'assegnatario si legge nella select, senza avatar ripetuto accanto.
Dalla v3 (D-45) le liste dicono di essere **del gruppo**: sotto l'intestazione della pagina «Le liste sono del gruppo: le vedono e le usano tutti i partecipanti.», e sotto il titolo di ogni card «Lista condivisa: decidete chi porta cosa» (o «chi se ne occupa») in `muted` 0.875rem. I tipi si chiamano «Da portare (insieme)» e «Da fare». La scelta della persona non è sempre visibile: se nessuno è deciso c'è solo il link «Chi lo porta?» / «Chi se ne occupa?» (nome accessibile «Chi porta Phon?»), che apre la select con prima voce «Da decidere»; se qualcuno è già deciso la select si vede subito. Il filtro si chiama «Solo quelle per me».

### Griglia foto e visualizzatore (v2)
Griglia a 3 colonne con gap 4 px, miniature quadrate (`object-fit: cover`) a raggio 10 px; ogni miniatura è un bottone con anello di focus cobalto. Mentre l'immagine protetta si scarica, al suo posto c'è un riquadro `surface-1` della stessa misura (`img-placeholder`), così la griglia non salta. Il visualizzatore è la modale con l'immagine `contain` (al massimo 70vh) e sotto «Caricata da … · data» in `muted`.

### Mappa e popup (v2)
Mappa OpenStreetMap alta 60vh (minimo 320 px) in un riquadro a raggio 16 px con bordo `line`; `isolation: isolate` tiene i livelli di Leaflet sotto la tab bar fissa. I segnaposto sono cerchi cobalto pieni da 10 px con bordo bianco 2 px, non le puntine blu di default. Il popup mostra la miniatura 160×120 a raggio 8 px e la didascalia, ed è un bottone che apre il visualizzatore. Sotto la mappa le stesse foto sono un elenco di link testuali (didascalia, data, autore): la mappa non è mai l'unico accesso. Senza foto con posizione, al posto della mappa c'è una frase che spiega come aggiungerla.

### Caricamento foto (v2)
Modale «Carica foto» con «Scegli dal telefono» secondario e una riga per ogni foto scelta: miniatura, e se la foto ha il GPS una checkbox «Mostra sulla mappa» non spuntata (la posizione si condivide solo per scelta). Il bottone primario dice «Carica 3 foto» con il numero, «Carica foto» disattivato quando non c'è niente da caricare. Le foto si riducono sul telefono prima dell'invio.

### Scontrino (v2)
Nel form della spesa, miniatura 120×160 a raggio 10 px con bordo `line` e i bottoni piccoli «Sostituisci lo scontrino» / «Rimuovi»; nell'elenco spese un'icona ricevuta `ink-3` dopo la descrizione dice che lo scontrino c'è, con etichetta «con scontrino» per i lettori di schermo.

### Card meteo (v2)
Nella panoramica, una fila orizzontale di giorni (scorre su mobile, senza barra visibile): ogni giorno è un riquadro `surface-1` a raggio 12 px con giorno abbreviato 0.8125rem/600 `ink-2`, icona Material Symbols 28 px cobalto, descrizione a parole per i lettori di schermo e minima/massima in cifre tabulari. Se il servizio non risponde la card non compare: il meteo è un extra, mai un errore.

### Select (v2)
`.select`: stessa famiglia dei campi (48 px, raggio 12 px, fondo `surface-1`, bordo `surface-3`, 16 px), focus su bianco con bordo cobalto. Le opzioni dicono codice e nome per esteso («EUR — Euro»), con il nome dalla lingua del browser (`Intl.DisplayNames`).

### Foto profilo (v2)
Dove c'è una foto profilo il cerchio delle iniziali diventa l'immagine ritagliata a cerchio, stessa misura e stesso anello per «tu»; senza foto restano le iniziali. Nel profilo l'avatar è grande, 88 px.

### Chat (v3)
Elenco con `role="log"`: messaggi propri a destra su `accent-tint` senza bordo, altrui a sinistra in bolla bianca con bordo `line`, raggio 16 px, testo che va a capo da solo (`pre-wrap`). Nome (0.8125rem/600 `ink-2`) e avatar 32 px solo sul primo messaggio di un blocco della stessa persona entro 5 minuti; chi scrive è sempre detto anche ai lettori di schermo, «Tu» per i propri. Orario `HH:mm` `muted` sotto la bolla. Separatori di giorno «Oggi», «Ieri», «lun 3 nov» come pillole `surface-2` centrate. Righe evento centrate, 0.875rem `ink-2` con icona: per le spese sono link alla spesa. «Messaggio eliminato» in corsivo `ink-3` nella bolla. Elimina: icona cestino 44 px solo sui propri, con conferma in modale.
Il piede (`chat-footer`) tiene insieme «Marco sta scrivendo…» (0.875rem `muted`, riga sempre presente per non far saltare il layout) e il campo: `textarea` stile campo (48 px, cresce fino a 4 righe) e «Invia» primario; è appiccicato in basso, su mobile appoggiato sulla tab bar. Su mobile scorre solo la pagina; su desktop l'elenco ha un suo scorrimento. Pillola cobalto «Nuovi messaggi ↓» quando arriva qualcosa e non sei in fondo; banner ambra «Riconnessione…» se il canale è giù; a viaggio chiuso un riquadro `info` con lucchetto al posto del campo.

### Consigli AI (v3)
Card «Consigli per {destinazione}» con icona `auto_awesome` nel titolo: 3–5 righe con icona cobalto 24 px per categoria, categoria in testo piccolo `muted`, titolo 700 e testo `ink-2`. Bottone `soft` piccolo «Genera consigli» / «Rigenera (4 rimaste oggi)»; sotto, su riga propria, «Generato con AI · può contenere errori» in `muted`. Mentre genera, righe-segnaposto `surface-2` e «Sto pensando…» (`role="status"`). Senza chiave sul server la card non c'è.
Nelle liste Valigia, in fondo alla card sotto l'aggiunta voci, «Suggerisci voci» `soft` piccolo: apre una modale con le proposte già spuntate (checkbox 22 px), la stessa nota AI e «Aggiungi N voci» primario.

### Ritocchi dopo i test con gli amici (v3.1)
- **Chat:** in testa «Indietro» (secondario piccolo, torna da dove si è venuti o alla panoramica), titolo «Chat» e a destra il bottone 44 px del suono (`volume_up`/`volume_off`, `aria-pressed`).
- **Messaggio nuovo fuori dalla chat:** avviso in basso (sopra la tab bar su mobile, 400 px a destra su desktop), card bianca con ombra galleggiante, icona chat cobalto, «**Marco:** testo» su al massimo due righe, «Apri la chat» primario piccolo e chiudi 44 px; sparisce dopo 6 s; `role="status"`. Accompagnato da due note brevi generate dal browser, se il suono è attivo: mai solo il suono.
- **Righe espandibili:** spese e rimborsi hanno a destra un bottone 44 px `expand_more`/`expand_less` (`aria-expanded`, «Dettagli di …»); il dettaglio è un riquadro `surface-1` a raggio 12 px con il testo intero (divisione, nota) e, per le spese, la quota di ognuno con «conta per» o notti/giorni.
- **Campi data:** larghezza bloccata al contenitore anche in Safari su iPhone.

### Proposte di luoghi (v3.1, D-46/D-51)
Campo con `role="combobox"`: dalla 3ª lettera, dopo 150 ms (sotto il campo «Cerco luoghi…» finché la risposta non arriva), una lista sotto il campo (card bianca, bordo `line`, raggio 12 px, ombra card, al massimo 280 px con scorrimento). Ogni proposta è una riga da 44 px: nome 600 e sotto, in `muted`, regione e paese; la riga attiva su `accent-tint`. Frecce, Invio ed Esc; il numero di proposte è annunciato ai lettori di schermo. Il testo libero resta sempre valido: scegliere una proposta aggiunge solo le coordinate.

### Benvenuto nel viaggio (v3.1, D-50)
Card centrata (max 480 px) con la valigia 48 px cobalto, «Ti diamo il benvenuto in {viaggio}» e una frase `muted`; sotto il form a sinistra: «Conta per», arrivo e partenza già compilate con le date del viaggio, «Va bene così» primario e «Salta» secondario sulla stessa riga.

### Impostazioni a schede (v3.1, D-50)
Tre schede Viaggio · Persone · Io con lo stesso aspetto delle sezioni del viaggio su desktop (fondo `surface-2`, scheda attiva bianca con ombra card e testo cobalto), ma sempre in alto, anche su mobile. `role="tablist"`, frecce/Home/Fine, scheda nell'URL. Chi non organizza vede la scheda Viaggio come elenco `kv` in sola lettura. Nella lista Persone, sotto il nome, i valori diversi dal solito: «conta per 2 · arriva il 3 nov».

### Pagina di presentazione (v3.1)
Una colonna centrata (max 560 px): valigia 72 px, titolo «Vacanze tra amici, conti chiari», frase `muted`, «Crea un account» primario e «Accedi» secondario affiancati, «Ho un codice invito» come link. Poi tre card «Prima / Durante / Dopo» con icona cobalto 28 px (una colonna su mobile, tre da 720 px), «Come funziona» con l'elenco numerato a numeri cobalto, e il piè di pagina piccolo e `muted`.

### Home e viaggio in evidenza (v3.1, D-49)
«Ciao {nome}», poi la card del viaggio in evidenza: copertina 16:9 (l'ultima foto, `object-fit: cover`; senza foto la valigia su `accent-tint`), sotto lo stato in cobalto 700 («In corso · giorno 3 di 6», «Tra 12 giorni»), nome, destinazione, meteo di oggi a parole con icona e il saldo detto a parole («Ti devono 400,00 €»); su desktop copertina a sinistra e testo a destra. Azioni rapide in riga (Nuovo viaggio primario, Ho un codice `soft`, Nuova spesa secondario solo con un viaggio in corso). «I tuoi conti»: un riquadro `kv` con le pillole di saldo e «in N viaggi», solo se tutti i saldi sono nella stessa valuta, poi una riga per viaggio con importo col segno. «Ultime novità» con «Vedi tutte»; infine i viaggi divisi in «In corso e in arrivo» e «Passati».

### Profilo (v3.1)
Quattro card: Foto e dati, Password, I miei numeri, Preferenze. I numeri sono riquadri `surface-1` raggio 12 px con la cifra a 2rem/800 (cifre tabellari) e l'etichetta sotto in `ink-2` 600; la spesa del gruppo occupa una riga intera con «la tua parte» in piccolo. Le destinazioni sono chip statiche e sotto una mappa di 260 px con un cerchio cobalto per destinazione. Le preferenze sono righe con titolo e spiegazione `muted` a sinistra e un interruttore a destra (binario 44×26 `surface-3`, cobalto se acceso, pallino bianco), sempre con «Sì/No» scritto accanto.

### Reazioni ed emoji (v3.1, D-47)
Sotto la bolla, pillole alte 28 px (area da 44 px al tocco) con emoji e numero: bordo `line` e testo `ink-2`, le proprie con bordo e testo cobalto su `accent-tint`; a destra per i propri messaggi. La striscia delle sei reazioni è una pillola bianca galleggiante sopra la bolla con bottoni da 44 px; si apre col tocco lungo (500 ms), con «Reagisci» (`add_reaction`, compare al passaggio del mouse o al focus) e si chiude con Esc o toccando fuori. Nel campo, a sinistra, il bottone 44 px `mood` apre una griglia di 40 emoji (8 colonne da 44 px, 6 sotto i 400 px) in una card sopra il campo; la scelta va dove c'è il cursore. Le emoji stanno solo qui: mai nell'interfaccia (unica eccezione voluta: il ☕ della firma nel piè di pagina della presentazione).

### Illustrazioni in movimento (v3, D-43)
SVG nostri con colori dai token: **busta** (32×26, `ink-2`, cobalto se non letta) davanti a ogni notifica, il lembo si ribalta in 250 ms quando la si legge; **valigia** (24 px cobalto, coperchio su cerniera) nel titolo delle liste Valigia, si chiude e disegna una spunta quando l'ultima voce è fatta, e saltella nel banner di risveglio del server. I messaggi arrivati dal vivo entrano con dissolvenza e 8 px di scivolata in 200 ms. Animazioni con Motion (`m.*` con funzioni caricate a parte), sempre azzerate da `prefers-reduced-motion`.

### Sfondo stagionale (v3.2, D-58)
Un livello fisso dietro tutto (`.season-bg`, `position: fixed`, `z-index: -1`; non `background-attachment: fixed`, che iOS ignora) con l'illustrazione SVG della stagione: primavera (sakura, Fuji, sole rosso), estate (spiaggia, onde, ombrellone, secchiello, stella marina), autunno (colline, albero rosso, foglie a tre punte), inverno (montagne innevate, abeti, baita). Ogni stagione ha versione chiara e scura (luna, stelle, lanterna, lucciole, aurora) e due tagli: verticale per il telefono e orizzontale da 720 px, dove i fondi si ripetono a specchio e gli oggetti restano a grandezza naturale ai lati. Il disegno sta nel 40% basso; la stagione viene dal giorno a metà del viaggio aperto (invertita sotto l'equatore), dal calendario fuori da un viaggio. Decorativo: `aria-hidden`, `alt=""`, immagini pigre (la versione del tema non attivo non si scarica). File in `FE/src/shared/season/art/`, generati da uno script e non ritoccati a mano.

### Tema scuro e luna/sole (v3.2, D-57)
Stessi nomi di token con i valori notturni sotto `:root[data-theme='dark']`: fondo blu notte `#0f1620`, cobalto `#9db4ff`, lampone `#ff9cc4`, `--on-accent` blu notte per il testo sui colori pieni. Il tema (Automatico · Chiaro · Scuro) sta sull'account; il bottone luna/sole nell'intestazione lo cambia al volo, uno script in `index.html` lo applica prima del primo disegno (hash nella CSP). Le mappe invertono le tessere OpenStreetMap; i marcatori restano cobalto.

### Testo sopra il disegno (v3.2)
Lo sfondo è fisso: scorrendo, qualunque testo fuori da una card può finire sopra colline o mare. Titoli, date dei gruppi e paragrafi fuori da card, chat e modali passano a `ink-2` con un alone del colore di fondo (`text-shadow` su `--bg`); i link d'azione fuori dalle card diventano bottoni secondari (es. «Cestino»); il footer della presentazione e la Chat stanno su vetro. La Chat è un solo pannello di vetro con intestazione e barra di scrittura appiccicate; sotto i 420 px «Invia» è solo l'icona (il nome resta per i lettori di schermo).

### «Indietro» (v3.2)
Bottone secondario piccolo con freccia, alto 44 px, in cima al contenuto di ogni pagina tranne Home, presentazione, accesso e registrazione; in Chat sta nell'intestazione. Torna alla pagina precedente dell'app; aperta da un link diretto va alla pagina madre (modulo → lista, sezione → panoramica, panoramica → Home). Dopo un salvataggio si torna da dove si era partiti; le schede del viaggio sono laterali e non allungano la strada del ritorno.

### Card Giochi e «Chi offre?» (v3.2, D-52)
Card nella panoramica con sfumatura `accent-tint` → vetro: righe da 48 px con icona cobalto («Chi offre?», «Il vostro viaggio in numeri», che a viaggio aperto dice «arriva a fine viaggio»). La ruota sta in un modale: chip con avatar per scegliere chi c'è (chi non ha account parte non spuntato), ruota SVG con gli spicchi nei **pastelli della stagione del viaggio** e i nomi in inchiostro scuro `#141c26` in entrambi i temi, freccia in `ink`, 3 s di rotazione con frenata, verdetto 1.5rem/800 cobalto in `role="status"` che riceve il focus, coriandoli negli stessi pastelli. Con «Riduci le animazioni» niente rotazione né coriandoli: verdetto subito.

### Riepilogo di fine viaggio (v3.2, D-53…D-55)
Tre fasi. **Scommessa**: card centrata con il dado, il campo importo grande con la valuta, «Scommetto!» (attivo solo con un importo) e «Salta e guarda i numeri». **Rivelazione**: il totale sale da 0 in 1,2 s; solo a numero fermo arrivano lo scarto, chi ha indovinato meglio (frasi neutre: «scarto di…», «Ha indovinato meglio: …») e i coriandoli. **Pagina**: copertina 220 px (ultima foto con velo scuro, o cobalto pieno fisso: il testo è sempre bianco), totale e quota a persona, «Dove sono finiti i soldi» (righe icona · nome · importo, barra cobalto 8 px e percentuale), record in `kv`, momenti in griglia con mappa, «Il gruppo» (solo se c'è almeno una foto, un messaggio o una reazione), badge, classifiche, chiusura con «Conti chiusi» o il link ai rimborsi che mancano, e l'immagine per le storie.
- **Badge**: griglia a 2 colonne (3 da 720 px), card raggio 16 su tinte dei token (`accent-tint`, `amber-tint`, `surface-1/2`, mai il lampone); avatar e nome, l'emoji del badge accanto al nome, titolo 700 con l'articolo legato alla parola dopo, dettaglio in `ink-2` con la valuta del viaggio. Titoli senza genere (v3.3, D-64): 💰 Cassa del gruppo, 📸 Occhio da reporter, 💬 Voce del gruppo, 🍝 Buona forchetta, ⏱️ Conti in ordine, ❤️ Cuore del gruppo, 🧭 Giramondo, 🧳 Compagnia di viaggio.
- **Classifiche**: solo foto, messaggi e reazioni (mai soldi); chi è in testa al centro con avatar grande, il resto del podio ai lati, singolare con 1 («1 messaggio»); sparisce se sono tutti a zero.

### Immagine per le storie (v3.2, D-56)
PNG 1080×1920 disegnato con Canvas nel browser: foto di copertina ritagliata 9:16 e sfocata con velo scuro, o sfumatura cobalto → blu notte → viola notte; nome (accorciato con «…» se non sta), date, totale 150 px, colonne quota/foto/messaggi (quelle a zero non compaiono), fino a 4 badge, logo mappamondo e firma. Etichette in `#c9d5ff` sul fondo scuro. Anteprima 180 px, poi «Condividi» (foglio di condivisione del telefono) o «Scarica»; la nota sotto dice che non ci sono saldi personali.

### Campo importo (v3.2, aggiunte)
`AmountField` sopra `Field`: tastiera decimale, suffisso della valuta in cobalto, un tasto che rende l'importo impossibile (lettera, separatore in più, terzo decimale, settima cifra intera) viene ignorato (`nextAmount`); i punti delle migliaia restano mentre scrivi e spariscono uscendo dal campo («1.234,56» → «1234,56»); l'incolla si ripulisce senza tagliare le cifre intere e oltre 999.999,99 il modulo dice «Al massimo 999.999,99». Stessa pulizia nelle quote personalizzate. Il layout regge l'importo massimo a 390 px senza scorrimenti.

### Campo password con occhiolino (v3.2, aggiunte)
`PasswordField`: bottone 44 px dentro il campo a destra, icona `visibility` / `visibility_off` in `ink-2`, nome «Mostra password» / «Nascondi password» e `aria-pressed`; anello di focus interno cobalto. In accesso, registrazione, profilo e ripristino.

### Password dimenticata (v3.2, D-61)
Due pagine pubbliche nello stile dell'accesso (logo, titolo, una card): «Password dimenticata» (email → card di conferma con icona, sempre lo stesso testo, «Il link vale 30 minuti») e «Nuova password» (due `PasswordField`, poi card «Password cambiata» con «Accedi»; link non valido o scaduto → card con icona `link_off` e «Chiedi un nuovo link»). «Password dimenticata?» sotto «Entra», area di 44 px. Niente «Indietro» globale: «Torna all'accesso».

### Destinazione dall'elenco (v3.2, D-60)
Il combobox dei luoghi è obbligatorio per la destinazione del viaggio: senza una proposta scelta l'errore di campo è «Scegli la destinazione dall'elenco»; se la ricerca non risponde, sotto il campo compare in lampone «Ricerca dei luoghi non disponibile, riprova tra poco». Nelle impostazioni la scelta serve solo se la destinazione cambia.

### Offline e app installata (v3.5, D-63)
- **Barra offline**, sotto l'intestazione come «si sta svegliando»: fondo `surface-2`, testo `ink`, icona `cloud_off`, «Sei offline · dati delle HH:MM · serve la rete per salvare» (con la data se i dati non sono di oggi; l'ora è quella del dato più vecchio della pagina). Al ritorno «Di nuovo online» su `accent-tint` per 3 s. Offline la barra del server che si sveglia non compare.
- **Pagina mai aperta**: al posto dello spinner, empty state con `cloud_off` e «Questa pagina non è ancora salvata sul telefono: aprila una volta con la rete».
- **Controlli offline**: i bottoni di salvataggio e le azioni («Nuova spesa», «Salda», «Carica foto», «Chi offre?», campo della chat) restano visibili ma spenti (opacità 0.5), con `title` «Serve la rete» e `aria-describedby="offline-reason"` verso la barra; un tocco che prova a cambiare qualcosa mostra in basso «Serve la rete: non è stato salvato» per 4 s (fondo `ink`, testo `surface`).
- **Foto e mappa**: foto mai vista → segnaposto `surface-2` con `image_not_supported` e «Serve la rete»; mappa → riquadro `surface-2` alto 160 px con «La mappa serve la rete» (la lista sotto resta).
- **Barra «Aggiorna»**: card fissa in basso (sopra le tab su mobile), `surface` con ombra float, su due righe (v3.3): `system_update` + «C'è una nuova versione di SplitTrip» sopra, sotto i bottoni piccoli alti 44 px «Aggiorna» (primario, a sinistra) e «Dopo» (secondario, a destra), ai due estremi perché un tocco non prenda quello sbagliato; a destra lascia libera la colonna del «+».
- **Profilo, sezione «App»**: installabile → testo breve + «Installa SplitTrip» (`install_mobile`); iPhone/iPad → due passi numerati con `ios_share` e `add_box`; già installata → `check_circle` cobalto + «SplitTrip è installata su questo dispositivo»; altrimenti «Puoi installarla dal menu del browser, se lo permette».
- **Icone**: mappamondo del logo, 192/512 trasparenti, 512 maskable e 180 per iPhone su fondo `#f8f9ff` (`FE/scripts/make-pwa-icons.sh`).

### Impostazioni di sistema (v3.3, D-65)
L'app segue quello che la persona ha già scelto sul telefono o nel computer, senza preferenze proprie.
- **Testo grande**: `:root` a `font-size: 100%` e tutte le dimensioni del testo e delle icone in `rem`, mai in `px`; su iPhone e iPad `font: -apple-system-body` (solo dove esiste `-webkit-touch-callout`: sul Mac varrebbe 13 px) segue Dynamic Type. Al 200% nessuna pagina scorre di lato a 430 px.
- **Contrasto aumentato** (`prefers-contrast: more`), nei due temi: vetro pieno (`--surface-glass` = `--surface`), `ink-3` sale a `ink-2`, bordi più scuri, link sottolineati, focus da 4 px.
- **Colori forzati** (`forced-colors: active`, temi a contrasto di Windows): sfondo stagionale nascosto, bordo `CanvasText` su bottoni, card, campi, pillole, chip, badge, «+» e barre; focus `Highlight`; icone `currentColor`; disattivati in `GrayText`.
- **Movimento ridotto**: invariato da v3 (D-43), dal sistema o dal Profilo.
- **Telefoni stretti (320–359 px)**: nell'intestazione resta il mappamondo e il nome «SplitTrip» lo legge solo il lettore di schermo; titolo di pagina e bottone accanto (`.page-head`) vanno a capo; i bottoni lunghi nelle card centrate vanno a capo invece di uscire.
- **Verifica**: ogni pagina chiama `expectAccessible()` (axe) nel suo test; le prove a mano stanno in `docs/accessibilita-verifica.md`.

### QR dell'invito (v3.4, D-67)
- **Bottone «QR»** (`qr_code_2`, `btn-soft btn-sm`) accanto a «Condividi» nel riquadro del codice invito (Panoramica e Impostazioni → Persone).
- **Finestra «Entra nel viaggio»**: QR 240 px (al massimo la larghezza della finestra), sotto il codice nello stile `.code` e «Inquadra per entrare in «nome»» in `muted`, che va a capo; «Chiudi» secondario. La finestra esiste solo mentre è aperta.
- **Eccezione di colore dichiarata**: moduli `#141c26` su `#ffffff` in tutti e due i temi e con i colori forzati (`forced-color-adjust: none`), perché molte fotocamere non leggono un QR chiaro su scuro. Durante il caricamento un riquadro `surface-2` della stessa misura; se non si carica, «Usa il codice qui sotto».

### Valute (v3.6, D-69)
- **Menu «Valuta»** sotto l'importo, nei moduli di spesa e di rimborso (`select` standard): prima la valuta del viaggio, poi le altre 14; nella spesa parte dall'ultima usata nel viaggio.
- **Riga del cambio** in `muted`: «Cambio del 16 ott (BCE): 1 € = 177,82 JPY» con «Modifica» come link (`btn-link`, 44 px); il campo a mano «1 € = … JPY» è stretto (7rem); se il cambio manca, il messaggio in `field-error` e il campo. Sotto, l'anteprima «≈ 11,25 €» in `muted`; sul bottone «Salva» l'eco «· 2.000 JPY ≈ 11,25 €».
- **Negli elenchi** (spese e rimborsi) l'importo dello scontrino grande, «≈ …» nella valuta del viaggio piccolo sotto; saldi, riepilogo e «Salda» proposto solo nella valuta del viaggio.
- **Valute senza centesimi** (JPY, HUF, ISK, KRW): campo senza virgola, segnaposto «0», importi senza decimali; il punto delle migliaia sempre.

### Copertina del viaggio (D-71)
- **Nel visualizzatore della foto**: «Usa come copertina» (`btn-secondary btn-sm`, icona `wallpaper`) per chiunque sia nel viaggio; se la foto è già la copertina, pillola positiva «È la copertina del viaggio» e «Togli copertina». Offline i due bottoni sono spenti (serve la rete).
- **Nella Home**: tutta la copertina del viaggio in evidenza è un link al viaggio (`a.featured-cover`, `aria-hidden`, fuori dal Tab: per il lettore di schermo resta il solo «Apri …»); con la foto scelta o, senza scelta, l'ultima caricata; senza foto, la valigia.

### Modale
`<dialog>` bianco, raggio 16 px, padding 24 px, larghezza massima 420 px, ombra modale e backdrop d'inchiostro al 45%; azioni allineate a destra.

## Do's and Don'ts

### Do:
- **Do** accompagnare ogni importo con segno con la pillola freccia + testo (The Never Color Alone Rule).
- **Do** usare `accent` (#00685c) e `negative` (#aa361e) per il testo dei soldi; `negative-2` solo nelle barre.
- **Do** mantenere target touch di almeno 44 px (bottoni 48, chip 40 dentro righe da 44, tab 44/52, FAB 60) e campi a 16 px.
- **Do** lasciare visibile l'anello di focus doppio (`--focus`) su ogni elemento interattivo, anche sui controlli nascosti dentro chip e avatar.
- **Do** limitare il movimento a transizioni da 150 ms (300 ms per le barre) con `--ease` e, dalla v3 (D-43), a poche animazioni con uno scopo da 200–600 ms (busta, valigia, messaggi in arrivo); tutto si azzera con `prefers-reduced-motion` e nessuna informazione sta solo nel movimento.
- **Do** usare i cerchi con le iniziali ovunque compaia una persona, con l'anello cobalto per «tu».
- **Do** usare Material Symbols Outlined (peso 500, `aria-hidden` se decorative, `aria-label` se sole) per ogni icona.
- **Do** dare a ogni categoria nuova una famiglia di colore fuori dal lampone, con testo scuro su tinta chiara che passi AA.

### Don't:
- **Don't** usare la famiglia del lampone per qualcosa che non sia «devi dare», un errore o un'azione distruttiva.
- **Don't** affidare un'informazione al solo colore: niente importi senza segno ed etichetta, niente badge senza testo, niente errori senza icona e testo.
- **Don't** usare `negative-2` (#ff7355) o `accent-2` come colore del testo.
- **Don't** introdurre un secondo carattere display o font di sistema come titolo.
- **Don't** usare emoji o glifi tipografici come icone; la freccia «→» dentro il testo dei trasferimenti («Giulia → Marco») è copy, non icona.
- **Don't** costruire elenchi grigi di transazioni con un accento solo, né l'estetica blu istituzionale di una banca.
- **Don't** usare ombre nere pure o ombre dure sfalsate.
