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
  teal: "#00685c"
  teal-2: "#1b8375"
  teal-soft: "#97f3e2"
  teal-tint: "#e4f6f2"
  coral: "#aa361e"
  coral-2: "#ff7355"
  coral-soft: "#ffdad3"
  coral-tint: "#fff1ee"
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
    backgroundColor: "{colors.teal}"
    textColor: "{colors.surface}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "0 20px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.teal-2}"
  button-soft:
    backgroundColor: "{colors.teal-tint}"
    textColor: "{colors.teal}"
    rounded: "{rounded.control}"
    padding: "0 20px"
    height: "48px"
  button-soft-hover:
    backgroundColor: "{colors.teal-soft}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0 20px"
    height: "48px"
  button-secondary-hover:
    backgroundColor: "{colors.surface-1}"
  button-danger:
    backgroundColor: "{colors.coral}"
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
    backgroundColor: "{colors.coral-tint}"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.radius}"
    padding: "{spacing.space-4}"
  balance-pill-positive:
    backgroundColor: "{colors.teal-tint}"
    textColor: "{colors.teal}"
    typography: "{typography.label}"
    rounded: "{rounded.radius-pill}"
    padding: "4px 10px 4px 8px"
  balance-pill-negative:
    backgroundColor: "{colors.coral-tint}"
    textColor: "{colors.coral}"
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
    backgroundColor: "{colors.teal-tint}"
    textColor: "{colors.teal}"
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
    backgroundColor: "{colors.teal}"
    textColor: "{colors.surface}"
  avatar:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink-2}"
    typography: "{typography.label}"
    rounded: "{rounded.radius-pill}"
    size: "40px"
  avatar-me:
    backgroundColor: "{colors.teal-tint}"
    textColor: "{colors.teal}"
  category-icon:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.teal}"
    rounded: "{rounded.radius-pill}"
    size: "44px"
  tab-active:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.teal}"
    rounded: "{rounded.radius-sm}"
    height: "44px"
  tab-active-mobile:
    backgroundColor: "{colors.teal-tint}"
    textColor: "{colors.teal}"
    height: "52px"
  fab:
    backgroundColor: "{colors.teal}"
    textColor: "{colors.surface}"
    rounded: "{rounded.radius-pill}"
    size: "60px"
---

# Design System: SplitTrip

## Overview

**Creative North Star: "Il taccuino di viaggio del gruppo"**

SplitTrip è uno strumento da usare in piedi, con una mano, al ristorante o in taxi: il sistema visivo esiste per rendere leggibile in un colpo d'occhio una sola informazione, il saldo personale. Fondo azzurro-latte, superfici a strati che salgono dal bianco al grigio-azzurro, card bianche morbide (raggio 16 px) con un'ombra appena percepibile. Un solo accento d'azione, il teal, che è anche il colore del «devi ricevere»; il corallo compare solo quando qualcuno deve dare.

La densità è da app mobile: righe da 44 px, bottoni da 48 px, importi grandi in DM Sans extrabold con cifre tabulari, ogni importo con segno accompagnato da una pillola freccia + testo. Il segno ricorrente sono i cerchi con le iniziali dei partecipanti: tornano nel header, nella dashboard, nel form spesa come selettore del pagante, nei saldi e nei membri. Le icone sono Material Symbols Outlined (peso 500), mai glifi o emoji come icone.

Rifiuti confermati: non deve sembrare una banca o una fintech (niente blu istituzionale, niente tabelle grigie di transazioni con un accento solo) e non deve risultare minimal e anonimo. Tema solo chiaro: l'uso tipico è all'aperto, di giorno (D-26).

**Key Characteristics:**
- Fondo `bg` azzurro-latte, superfici a strati `surface-1` → `surface-3`, card bianche raggio 16 px.
- Teal = azione e «devi ricevere»; corallo = solo «devi dare».
- DM Sans ovunque; importi 40 px / 24 px extrabold con cifre tabulari.
- Pillola di saldo freccia + testo incollata a ogni importo con segno.
- Cerchi con le iniziali come segno dei partecipanti; anello teal per «tu».
- Tab bar in basso su mobile, segmentata in alto su desktop; FAB «+» nelle liste.
- Accessibilità D-24 come vincolo visivo, non come rifinitura.

## Colors

Una palette fredda e luminosa con un accento teal deciso e un corallo riservato al debito.

### Primary
- **Teal Rotta** (`teal`): bottoni primari, link, chip e tab attivi, FAB, testo e importi positivi, «devi ricevere», icone in `info` e negli stati vuoti, cursore e `accent-color`. È il colore di testo positivo: passa AA su `surface`, `bg` e `teal-tint`.
- **Teal Acqua** (`teal-2`): hover dei bottoni primari e del FAB; riempimento delle barre di saldo positive.
- **Teal Laguna** (`teal-soft`): selezione del testo, hover del bottone soft.
- **Teal Velo** (`teal-tint`): fondo del bottone soft, della pillola positiva, del badge «In corso», dell'avatar «tu», del tab attivo su mobile e dei cerchi icona negli stati vuoti e nel logo di accesso.

### Secondary
- **Corallo Scuro** (`coral`): unico corallo ammesso per il testo. Importi negativi, pillola «devi dare», errori di campo e di form, bordo dei campi non validi, bottone di conferma distruttiva.
- **Corallo Vivo** (`coral-2`): solo riempimento delle barre di saldo negative. Mai per il testo.
- **Corallo Velo** (`coral-tint`): fondo della pillola negativa e dei campi non validi.
- **Corallo Rosa** (`coral-soft`): definito nei token, oggi non usato nel build.

### Tertiary
- **Ambra Bussola** (`amber`) su **Ambra Velo** (`amber-tint`): stato «In pianificazione», banner di risveglio del server, categoria «Attività».
- **Categorie di spesa**: cibo (`cat-food` su `cat-food-tint`, prugna), trasporti (`cat-transport` su `cat-transport-tint`, blu), alloggio (`cat-lodging` su `cat-lodging-tint`, viola), attività (ambra), altro (`ink-2` su `surface-2`). Nel build questi valori sono letterali nelle classi `.cat-*`, non variabili CSS.

### Neutral
- **Azzurro Latte** (`bg`): fondo della pagina, colore interno dell'anello di focus.
- **Bianco Carta** (`surface`): card, header, tab bar mobile, modale, campi a fuoco, tab attivo su desktop.
- **Azzurro Nebbia** (`surface-1`): fondo dei campi, riquadri tinti dentro le card (`kv`, `info`, `invite`), cerchio icona di default, hover dei secondari e dei chip, divisori fra righe.
- **Azzurro Pietra** (`surface-2`): avatar degli altri partecipanti, pillola neutra, badge semplice, fondo delle barre e della barra dei tab su desktop.
- **Azzurro Ardesia** (`surface-3`): bordi di campi, chip e bottoni secondari; badge «Chiuso»; binario dello spinner.
- **Linea** (`line`): bordi di card, header e tab bar mobile.
- **Inchiostro** (`ink`): testo principale. **Inchiostro 2** (`ink-2`): etichette dei campi, testo dei chip e dei badge. **Inchiostro 3** (`ink-3`): testo secondario (`.muted`), meta, `h3`, placeholder.

### Named Rules
**The Coral Means Owing Rule.** Il corallo significa solo «devi dare» (e, per estensione, errore e azione distruttiva). Nessuna categoria, decorazione o stato neutro usa la famiglia del corallo: le categorie stanno su prugna, blu, viola, ambra e grigio-azzurro.

**The Never Color Alone Rule.** Ogni importo con segno porta il segno (`+` / `−`) e una pillola con freccia e testo («↑ Devi ricevere», «↓ Devi dare», «✓ Sei in pari»); i badge di stato hanno sempre il testo; gli errori hanno icona e testo. Il colore conferma, non informa da solo.

**The Dark Coral For Text Rule.** Per il testo si usano solo `teal` e `coral` (contrasto WCAG AA). `coral-2` e `teal-2` vivono nelle barre e nei riempimenti, mai come colore del testo.

## Typography

**Display Font:** DM Sans (con system-ui, -apple-system, Segoe UI, Roboto, sans-serif)
**Body Font:** DM Sans (stesso stack)
**Label/Mono Font:** ui-monospace, SF Mono, Menlo, solo per il codice invito

**Character:** Un'unica grotesk geometrica e cordiale, usata in tutti i pesi da 400 a 800; la gerarchia nasce dal peso e dalla dimensione, non da un secondo carattere. I numeri sui soldi sono sempre tabulari, così le colonne di importi restano allineate.

### Hierarchy
- **Display** (800, 2.5rem, 1.1, -0.03em, tabulari): il saldo personale nella dashboard e nella pagina saldi; anche l'importo nel form nuova spesa (`amount-input`, 2.5rem/800 centrato, campo alto 72 px).
- **Headline** (700, 1.75rem, -0.01em; 1.5rem sotto i 720 px): `h1`, nome del viaggio e titolo di pagina. `text-wrap: balance`.
- **Amount** (800, 1.5rem, -0.02em, tabulari): saldo nell'intestazione del viaggio e importi dei trasferimenti suggeriti.
- **Title** (700, 1.125rem, -0.01em): `h2`, titoli delle card, degli stati vuoti e delle modali; 1.25rem nelle card viaggio. Il marchio usa 1.125rem/800/-0.02em in teal.
- **Body** (400, 1rem, 1.45): testo corrente; i campi sono sempre a 1rem (16 px) per evitare lo zoom su iOS. Importi in riga: 700, tabulari.
- **Label** (600, 0.875rem): etichette dei campi (`ink-2`), etichette dei valori come «Il tuo saldo» (`ink-3`), pillole di saldo, `h3` (`ink-3`).
- **Meta** (600 o 400, 0.8125rem): badge di stato, nomi sotto gli avatar, testo secondario nelle colonne destre delle righe. Testo dei tab su mobile: 0.6875rem/600.
- **Codice** (mono 600, 1.125rem, spaziatura 2px): solo il codice invito, in un riquadro bianco con bordo tratteggiato.

### Named Rules
**The Tabular Money Rule.** Ogni importo usa `font-variant-numeric: tabular-nums`, peso 700 in riga e 800 quando è protagonista, e non va mai a capo.

**The One Family Rule.** DM Sans ovunque; il monospace è riservato al codice invito. Nessun carattere di sistema come display.

## Layout

Mobile-first, una colonna fino a 719 px; da 720 px le card della dashboard e dei saldi si dispongono su una griglia a due colonne (`grid-2`, gap 12 px) con la card del saldo a tutta larghezza (`span-2`). Il contenuto principale ha larghezza massima 1040 px, centrato, con padding 16 px ai lati e 32 px in fondo; le pagine di accesso si restringono a 420 px.

Ritmo di spaziatura su scala 4/8/12/16/24/32 (`space-1` → `space-6`): 12 px fra card e fra elementi di una riga, 16 px di padding nelle card e sotto le intestazioni di pagina, 24 px nelle modali, 32 px negli stati vuoti. Le righe di lista hanno padding verticale 10 px e un divisore `surface-1`; le colonne destre delle righe sono allineate a destra e non si stringono.

Navigazione del viaggio: sopra i 720 px una barra segmentata in alto (fondo `surface-2`, raggio 14 px, tab attivo bianco con ombra card); sotto i 720 px la stessa barra diventa una tab bar fissa in basso, bianca, con icona sopra l'etichetta, rispetto della safe area e 164 px di padding inferiore sul contenuto. Il FAB da 60 px sta in basso a destra (20/24 px dai bordi; 84 px dal fondo quando c'è la tab bar). L'header è sticky, bianco, con bordo inferiore.

**The Balance First Rule.** Su ogni schermata del viaggio il saldo personale con la sua pillola è leggibile senza scorrere: nella card del saldo in dashboard e saldi, e nell'intestazione del viaggio nelle altre schede.

## Elevation & Depth

Profondità ibrida: soprattutto tonale (fondo azzurro-latte, card bianche, riquadri tinti `surface-1` dentro le card), con un'ombra card morbida e quasi impercettibile che stacca le card dal fondo. Le ombre più forti sono riservate agli elementi che galleggiano davvero: FAB e modale.

### Shadow Vocabulary
- **Card a riposo** (`box-shadow: 0 1px 2px rgba(20, 28, 38, 0.04), 0 10px 24px -14px rgba(20, 28, 38, 0.22)`, token `--shadow-card`): card e tab attivo su desktop.
- **Card viaggio in hover** (`box-shadow: 0 2px 4px rgba(20, 28, 38, 0.05), 0 18px 32px -16px rgba(20, 28, 38, 0.3)`, con `translateY(-2px)`): solo le card cliccabili della lista viaggi.
- **Galleggiante teal** (`box-shadow: 0 6px 18px -4px rgba(0, 104, 92, 0.45)`, token `--shadow-float`): solo il FAB.
- **Modale** (`box-shadow: 0 24px 48px -12px rgba(20, 28, 38, 0.35)`, backdrop `rgba(20, 28, 38, 0.45)`).
- **Anello di focus** (`box-shadow: 0 0 0 3px var(--bg), 0 0 0 6px var(--teal)`, token `--focus`): doppio anello, fondo poi teal.

### Named Rules
**The Tinted Ink Shadow Rule.** Le ombre sono sempre dell'inchiostro `#141c26` a bassa opacità (o del teal per il FAB), morbide e con spread negativo; mai nere pure, mai ombre dure sfalsate.

## Shapes

Forme morbide e amichevoli. Card e modale a 16 px (`radius`); bottoni, campi, riquadri tinti e codice invito a 12 px (`control`, valore letterale ripetuto nel CSS, non variabile); tab e campi quota a 10 px (`radius-sm`); barra segmentata a 14 px. Tutto ciò che rappresenta una persona, una categoria o uno stato è un cerchio o una pillola: avatar, cerchi categoria (44 px), FAB, badge, pillole di saldo, chip. Il logo di accesso è un quadrato morbido da 72 px con raggio 22 px. Le barre di saldo sono alte 8 px con raggio 4 px. Bordi da 1 px nei colori `line` / `surface-3`; l'unico bordo tratteggiato è quello del codice invito.

## Components

### Buttons
Pieni, alti e decisi: si premono con il pollice.
- **Shape:** angoli morbidi (12 px), altezza minima 48 px, padding orizzontale 20 px, peso 600, icona + testo con gap 8 px.
- **Primary:** fondo `teal`, testo bianco. Una sola azione primaria per contesto («Nuova spesa», «Salva», «Salda»).
- **Soft:** fondo `teal-tint`, testo `teal`; azione secondaria affermativa («Regola conti», «Condividi», «Ho un codice»).
- **Secondary:** fondo bianco, bordo `surface-3`, testo `ink` («Esci», «Annulla»).
- **Danger:** fondo `coral`, testo bianco, hover più scuro; solo nelle conferme distruttive.
- **Small:** 40 px di altezza, padding 14 px, 0.9375rem.
- **Hover / Focus / Active:** transizione 150 ms su fondo, trasformazione e ombra con `cubic-bezier(0.2, 0.8, 0.2, 1)`; `:active` scende di 1 px; focus con l'anello doppio; disabilitato a opacità 0.55. In caricamento il testo diventa «Attendi…».

### Chips
- **Style:** pillola alta 40 px, fondo bianco, bordo `surface-3`, testo `ink-2` 0.9375rem/500, icona 18 px opzionale. Avvolgono un radio nascosto (categorie nel form spesa), in una fila scorrevole su mobile.
- **State:** hover `surface-1`; selezionato fondo e bordo `teal`, testo bianco; il focus del radio interno mostra l'anello sul chip.
- **Scelta in linea (v1.5):** gli stessi chip, senza icona, fanno da gruppo di radio con `legend` per scelte secondarie dentro una sezione (Notti / Giorni nella divisione per presenza). Il nome accessibile è il testo del chip: le icone sono `aria-hidden`.

### Cards / Containers
- **Corner Style:** 16 px.
- **Background:** `surface` su fondo `bg`; dentro, riquadri tinti `surface-1` a 12 px per riepiloghi (`kv`), avvisi (`info`, icona teal) e codice invito.
- **Shadow Strategy:** ombra card a riposo (vedi Elevation & Depth).
- **Border:** 1 px `line`.
- **Internal Padding:** 16 px; i titoli `h2` hanno 12 px sotto.

### Inputs / Fields
- **Style:** fondo `surface-1`, bordo 1 px `surface-3`, raggio 12 px, altezza minima 48 px, testo 16 px, cursore teal. Etichetta sopra a 0.875rem/600 `ink-2`, gap 6 px.
- **Focus:** fondo bianco, bordo `teal`, più l'anello di focus globale.
- **Error:** bordo `coral` e fondo `coral-tint`; messaggio sotto con icona e testo `coral` 0.875rem/500.
- **Importo:** campo gigante 2.5rem/800 centrato, alto 72 px, con il simbolo della valuta in teal a destra.
- **Checkbox:** 22 px, riga cliccabile alta almeno 44 px, colore da `accent-color` teal.
- **«Conta per» (v3, D-44):** in Parti uguali, il link «Qualcuno conta per più di una persona?» apre accanto a ogni nome un gruppo di chip `½ · 1 · 2 · altro` (legenda nascosta «Marco conta per»; «altro» apre il campo numerico) con la quota in euro sotto; sopra l'elenco un riquadro `info` spiega a parole «Marco conta per 2: 60,00 € invece di 45,00 €». Si apre da solo se qualcuno conta già per più o meno di uno. In «La mia partecipazione» lo stesso gruppo con legenda visibile «Conta per» sostituisce il campo «Peso».
- **Numero in riga con anteprima (v1.5):** nelle righe «Diviso tra» per Presenza (e per «altro» in Conta per), campo quota stretto (`weight-input`, 76 px) allineato a destra con l'anteprima della quota in euro sotto, `muted` 0.8125rem. Il campo è stretto apposta: il nome della persona non deve andare a capo. `aria-label` «Peso di …» / «Notti di …» / «Giorni di …».
- **Nota sotto un campo (v1.5):** `.hint`, 0.875rem `muted`, attaccata al campo sopra (margine negativo) e staccata 16 px dal successivo. Spiega il significato del valore (es. «1 = una persona, 2 = una coppia…»), non ripete l'etichetta.

### Navigation
- **Header:** bianco, sticky, marchio teal con icona valigia piena a sinistra; a destra campanella, avatar «tu» (link al profilo), nome (nascosto su mobile) ed «Esci» secondario piccolo.
- **Campanella (v2):** bottone rotondo 44 px con icona 24 px `ink-2`, hover `surface-1`; il contatore dei non letti è una pillola `coral` 18 px con numero bianco 0.6875rem/700 in alto a destra, e il nome accessibile dice il numero a parole («Notifiche, 2 non lette»).
- **Tab del viaggio:** desktop, barra segmentata `surface-2` con tab alti 44 px, 0.9375rem/600 `ink-2`, attivo bianco con testo teal e ombra card. Mobile, tab bar fissa in basso, icona 24 px sopra etichetta 0.6875rem, tab alti 52 px, attivo su `teal-tint`. Cinque tab (v2): Panoramica, Spese, Saldi, Liste, Foto; le impostazioni del viaggio stanno in un bottone ingranaggio 44 px nell'intestazione (`aria-label` «Impostazioni del viaggio»), non in una sesta tab. Accanto, a sinistra, il **bottone Chat** (v3, D-42): stesso bottone 44 px con icona `chat_bubble` e il numero dei non letti nella pillola `coral` della campanella; `aria-label` «Chat, 3 messaggi non letti». I due bottoni stanno affiancati (`head-actions`), anche su mobile.
- **FAB:** cerchio teal da 60 px con «+» da 30 px e ombra galleggiante; hover `teal-2` e scala 1.04. Vive nelle liste (viaggi, spese, foto), non nella dashboard. Nella pagina Foto l'icona è la fotocamera con «+».

### Pillola di saldo (signature)
Pillola (padding 4/10/4/8 px, 0.875rem/600) con freccia Material Symbols da 18 px e testo: positiva `teal` su `teal-tint` con freccia in su, negativa `coral` su `coral-tint` con freccia in giù, in pari `ink-2` su `surface-2` con spunta. Sta sempre accanto a un importo con segno; in terza persona dice «Deve ricevere / Deve dare / In pari».

### Cerchi delle iniziali (signature)
Avatar circolari da 40 px (32 px piccoli, 56 px grandi) con due iniziali maiuscole 700. Gli altri partecipanti su `surface-2` / `ink-2`; «tu» su `teal-tint` / `teal` con doppio anello bianco + teal. Come selettore del pagante, la persona scelta diventa piena teal con testo bianco e nome in teal 700.
Chi partecipa senza account (v1.5) ha lo stesso cerchio: la differenza è detta a parole, con «senza account» in `small` sotto il nome, mai con un colore o un'icona sola (D-24). Le azioni di riga sulle persone (`row-actions`) vanno a capo allineate a destra invece di uscire dallo schermo.

### Cerchi categoria e badge di stato
Cerchi da 44 px con icona Material Symbols da 22 px nel colore della categoria su tinta della stessa famiglia. Badge di stato a pillola, 0.8125rem/600, con un pallino 7 px nel colore del testo e la parola dello stato.

### Barre di saldo
Binario `surface-2` alto 8 px, rientrato di 52 px per allinearsi al testo dopo l'avatar; riempimento `teal-2` o `coral-2` scalato in proporzione al saldo massimo, transizione 300 ms.

### Stati vuoti, spinner, banner
Stato vuoto centrato con icona da 40 px in un cerchio `teal-tint` da 72 px, titolo `h2` e azione. Spinner: anello 18 px `surface-3` con arco teal e testo `ink-3`. Banner di risveglio del server su `amber-tint` con testo `amber`.

### Card lista (v2)
Una `card` per lista: titolo `h3` 1.0625rem/700 `ink` con icona teal (valigia per «Valigia», spunta per le liste generali), contatore «2/5 fatte» a pillola e azioni piccole (rinomina, elimina) a destra. Ogni voce è una riga con checkbox `flex:none` e testo; la voce fatta è barrata in `ink-3`. Le azioni della voce (select dell'assegnatario `assign-select`, 40 px, raggio 10 px, fondo `surface-1`, e cestino) su mobile vanno sulla riga sotto, allineate a destra: il testo ha tutta la larghezza. L'assegnatario si legge nella select, senza avatar ripetuto accanto.

### Griglia foto e visualizzatore (v2)
Griglia a 3 colonne con gap 4 px, miniature quadrate (`object-fit: cover`) a raggio 10 px; ogni miniatura è un bottone con anello di focus teal. Mentre l'immagine protetta si scarica, al suo posto c'è un riquadro `surface-1` della stessa misura (`img-placeholder`), così la griglia non salta. Il visualizzatore è la modale con l'immagine `contain` (al massimo 70vh) e sotto «Caricata da … · data» in `muted`.

### Mappa e popup (v2)
Mappa OpenStreetMap alta 60vh (minimo 320 px) in un riquadro a raggio 16 px con bordo `line`; `isolation: isolate` tiene i livelli di Leaflet sotto la tab bar fissa. I segnaposto sono cerchi teal pieni da 10 px con bordo bianco 2 px, non le puntine blu di default. Il popup mostra la miniatura 160×120 a raggio 8 px e la didascalia, ed è un bottone che apre il visualizzatore. Sotto la mappa le stesse foto sono un elenco di link testuali (didascalia, data, autore): la mappa non è mai l'unico accesso. Senza foto con posizione, al posto della mappa c'è una frase che spiega come aggiungerla.

### Caricamento foto (v2)
Modale «Carica foto» con «Scegli dal telefono» secondario e una riga per ogni foto scelta: miniatura, e se la foto ha il GPS una checkbox «Mostra sulla mappa» non spuntata (la posizione si condivide solo per scelta). Il bottone primario dice «Carica 3 foto» con il numero, «Carica foto» disattivato quando non c'è niente da caricare. Le foto si riducono sul telefono prima dell'invio.

### Scontrino (v2)
Nel form della spesa, miniatura 120×160 a raggio 10 px con bordo `line` e i bottoni piccoli «Sostituisci lo scontrino» / «Rimuovi»; nell'elenco spese un'icona ricevuta `ink-3` dopo la descrizione dice che lo scontrino c'è, con etichetta «con scontrino» per i lettori di schermo.

### Card meteo (v2)
Nella panoramica, una fila orizzontale di giorni (scorre su mobile, senza barra visibile): ogni giorno è un riquadro `surface-1` a raggio 12 px con giorno abbreviato 0.8125rem/600 `ink-2`, icona Material Symbols 28 px teal, descrizione a parole per i lettori di schermo e minima/massima in cifre tabulari. Se il servizio non risponde la card non compare: il meteo è un extra, mai un errore.

### Select (v2)
`.select`: stessa famiglia dei campi (48 px, raggio 12 px, fondo `surface-1`, bordo `surface-3`, 16 px), focus su bianco con bordo teal. Le opzioni dicono codice e nome per esteso («EUR — Euro»), con il nome dalla lingua del browser (`Intl.DisplayNames`).

### Foto profilo (v2)
Dove c'è una foto profilo il cerchio delle iniziali diventa l'immagine ritagliata a cerchio, stessa misura e stesso anello per «tu»; senza foto restano le iniziali. Nel profilo l'avatar è grande, 88 px.

### Chat (v3)
Elenco con `role="log"`: messaggi propri a destra su `teal-tint` senza bordo, altrui a sinistra in bolla bianca con bordo `line`, raggio 16 px, testo che va a capo da solo (`pre-wrap`). Nome (0.8125rem/600 `ink-2`) e avatar 32 px solo sul primo messaggio di un blocco della stessa persona entro 5 minuti; chi scrive è sempre detto anche ai lettori di schermo, «Tu» per i propri. Orario `HH:mm` `muted` sotto la bolla. Separatori di giorno «Oggi», «Ieri», «lun 3 nov» come pillole `surface-2` centrate. Righe evento centrate, 0.875rem `ink-2` con icona: per le spese sono link alla spesa. «Messaggio eliminato» in corsivo `ink-3` nella bolla. Elimina: icona cestino 44 px solo sui propri, con conferma in modale.
Il piede (`chat-footer`) tiene insieme «Marco sta scrivendo…» (0.875rem `muted`, riga sempre presente per non far saltare il layout) e il campo: `textarea` stile campo (48 px, cresce fino a 4 righe) e «Invia» primario; è appiccicato in basso, su mobile appoggiato sulla tab bar. Su mobile scorre solo la pagina; su desktop l'elenco ha un suo scorrimento. Pillola teal «Nuovi messaggi ↓» quando arriva qualcosa e non sei in fondo; banner ambra «Riconnessione…» se il canale è giù; a viaggio chiuso un riquadro `info` con lucchetto al posto del campo.

### Consigli AI (v3)
Card «Consigli per {destinazione}» con icona `auto_awesome` nel titolo: 3–5 righe con icona teal 24 px per categoria, categoria in testo piccolo `muted`, titolo 700 e testo `ink-2`. Bottone `soft` piccolo «Genera consigli» / «Rigenera (4 rimaste oggi)»; sotto, su riga propria, «Generato con AI · può contenere errori» in `muted`. Mentre genera, righe-segnaposto `surface-2` e «Sto pensando…» (`role="status"`). Senza chiave sul server la card non c'è.
Nelle liste Valigia, in fondo alla card sotto l'aggiunta voci, «Suggerisci voci» `soft` piccolo: apre una modale con le proposte già spuntate (checkbox 22 px), la stessa nota AI e «Aggiungi N voci» primario.

### Illustrazioni in movimento (v3, D-43)
SVG nostri con colori dai token: **busta** (32×26, `ink-2`, teal se non letta) davanti a ogni notifica, il lembo si ribalta in 250 ms quando la si legge; **valigia** (24 px teal, coperchio su cerniera) nel titolo delle liste Valigia, si chiude e disegna una spunta quando l'ultima voce è fatta, e saltella nel banner di risveglio del server. I messaggi arrivati dal vivo entrano con dissolvenza e 8 px di scivolata in 200 ms. Animazioni con Motion (`m.*` con funzioni caricate a parte), sempre azzerate da `prefers-reduced-motion`.

### Modale
`<dialog>` bianco, raggio 16 px, padding 24 px, larghezza massima 420 px, ombra modale e backdrop d'inchiostro al 45%; azioni allineate a destra.

## Do's and Don'ts

### Do:
- **Do** accompagnare ogni importo con segno con la pillola freccia + testo (The Never Color Alone Rule).
- **Do** usare `teal` (#00685c) e `coral` (#aa361e) per il testo dei soldi; `coral-2` solo nelle barre.
- **Do** mantenere target touch di almeno 44 px (bottoni 48, chip 40 dentro righe da 44, tab 44/52, FAB 60) e campi a 16 px.
- **Do** lasciare visibile l'anello di focus doppio (`--focus`) su ogni elemento interattivo, anche sui controlli nascosti dentro chip e avatar.
- **Do** limitare il movimento a transizioni da 150 ms (300 ms per le barre) con `--ease` e, dalla v3 (D-43), a poche animazioni con uno scopo da 200–600 ms (busta, valigia, messaggi in arrivo); tutto si azzera con `prefers-reduced-motion` e nessuna informazione sta solo nel movimento.
- **Do** usare i cerchi con le iniziali ovunque compaia una persona, con l'anello teal per «tu».
- **Do** usare Material Symbols Outlined (peso 500, `aria-hidden` se decorative, `aria-label` se sole) per ogni icona.
- **Do** dare a ogni categoria nuova una famiglia di colore fuori dal corallo, con testo scuro su tinta chiara che passi AA.

### Don't:
- **Don't** usare la famiglia del corallo per qualcosa che non sia «devi dare», un errore o un'azione distruttiva.
- **Don't** affidare un'informazione al solo colore: niente importi senza segno ed etichetta, niente badge senza testo, niente errori senza icona e testo.
- **Don't** usare `coral-2` (#ff7355) o `teal-2` come colore del testo.
- **Don't** introdurre un secondo carattere display o font di sistema come titolo.
- **Don't** usare emoji o glifi tipografici come icone; la freccia «→» dentro il testo dei trasferimenti («Giulia → Marco») è copy, non icona.
- **Don't** costruire elenchi grigi di transazioni con un accento solo, né l'estetica blu istituzionale di una banca.
- **Don't** usare ombre nere pure o ombre dure sfalsate.
