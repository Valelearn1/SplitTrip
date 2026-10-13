---
name: Warm Companion Travel Flow
colors:
  surface: '#f8f9ff'
  surface-dim: '#d3dae9'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e7eefd'
  surface-container-high: '#e1e9f7'
  surface-container-highest: '#dbe3f1'
  on-surface: '#141c26'
  on-surface-variant: '#3e4946'
  inverse-surface: '#29313c'
  inverse-on-surface: '#eaf1ff'
  outline: '#6e7976'
  outline-variant: '#bdc9c5'
  surface-tint: '#006b5e'
  primary: '#00685c'
  on-primary: '#ffffff'
  primary-container: '#1b8375'
  on-primary-container: '#f8fffc'
  inverse-primary: '#7bd7c6'
  secondary: '#aa361e'
  on-secondary: '#ffffff'
  secondary-container: '#ff7355'
  on-secondary-container: '#6c0f00'
  tertiary: '#006c25'
  on-tertiary: '#ffffff'
  tertiary-container: '#28863b'
  on-tertiary-container: '#fbfff6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#97f3e2'
  primary-fixed-dim: '#7bd7c6'
  on-primary-fixed: '#00201c'
  on-primary-fixed-variant: '#005047'
  secondary-fixed: '#ffdad3'
  secondary-fixed-dim: '#ffb4a4'
  on-secondary-fixed: '#3e0500'
  on-secondary-fixed-variant: '#891e07'
  tertiary-fixed: '#99f89e'
  tertiary-fixed-dim: '#7edb85'
  on-tertiary-fixed: '#002106'
  on-tertiary-fixed-variant: '#00531b'
  background: '#f8f9ff'
  on-background: '#141c26'
  surface-variant: '#dbe3f1'
typography:
  display:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: '0'
  body-lg:
    fontFamily: DM Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: '0'
  body-md:
    fontFamily: DM Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: '0'
  body-sm:
    fontFamily: DM Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.01em
  amount-display:
    fontFamily: DM Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.02em
  amount-md:
    fontFamily: DM Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 22px
    letterSpacing: '0'
  label-md:
    fontFamily: DM Sans
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: DM Sans
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.03em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-tablet: 1.5rem
  margin-desktop: 2.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system expresses a warm, reliable, and companionable atmosphere tailored for collaborative holiday travel. It replaces sterile, anxiety-inducing ledger aesthetics with an inviting vacation journal ambiance.

### Visual Style
- **Warm Editorial Minimalist**: Grounded in creamy canvas foundations, breathable negative space, and earthy accents that feel sun-drenched rather than clinical.
- **Physical Souvenir Metaphor**: Cards resemble curated paper itineraries and boarding vouchers, featuring subtle warm borders and diffuse ambient shadows rather than stark digital containers.
- **Dual-Encoded Safety**: Financial figures are clear, approachable, and transparent, removing emotional friction between friends. Every balance communicates its status via explicit labels, iconic indicators, and accessible contrast ratios.

### Tone & Voice (Italian Localization)
- Casual, transparent, encouraging, and considerate.
- Friendly, conversational Italian (`Panoramica`, `Spese`, `Saldi`, `Aggiungi spesa`).
- Reassuring microcopy that mitigates travel friction without corporate stiffness.

## Colors

The palette balances warm earthen ground tones with distinct communicative signals, meeting strict WCAG 2.1 AA accessibility standards (contrast ratios ≥ 4.5:1 for body and data readouts).

### Base & Canvas Surfaces
- **Canvas (`#FBF9F5`)**: Sunlit warm sand tone serving as the default background for app views and scrollable viewports.
- **Surface (`#FFFFFF`)**: Pure warm white for primary interactive cards, modals, and input fields.
- **Border Default (`#EBE5DF`)**: Low-contrast warm stone outline creating tactile containment without visual noise.
- **Border Strong (`#D9D0C7`)**: Deliberate boundary for focused controls, dividing rules, and active states.

### Primary Accents (Teal / Sage)
- **Primary Base (`#1B8375`)**: Fresh, organic sea-sage for primary actions, current navigation indicators, and affirmative flows.
- **Primary Active (`#156E62`)**: Deep teal for pressed states and active links.
- **Primary Container (`#E4F2EF`)**: Subdued tint for selected list rows, chips, and subtle pills.

### Financial Balance Tokens (Dual-Encoded)
Financial values must never rely on color alone; each must pair its color token with an explicit prefix icon and Italian descriptor string.
- **Credit / Surplus (`#1E7E34`)**: Calm pine green. Always paired with the `+` glyph and the label `devi ricevere`.
- **Credit Container (`#EAF5ED`)**: Soft pine background for credit badge treatments.
- **Debt / Payable (`#C84B31`)**: Warm terracotta coral. Always paired with the `−` (true minus) glyph and the label `devi dare`.
- **Debt Container (`#FBECE8`)**: Soft terracotta background for payment badge treatments.
- **Settled / Neutral (`#5C6470`)**: Calibrated slate grey. Paired with the label `in pari`.

### System & Notice States
- **Notice Server Wakeup (`#FAF3E0`)**: Gentle golden amber background for the cold-start notice banner (`Il server si sta svegliando…`), paired with text `#7A5210` and border `#F0E0B8`.

## Typography

The typographic hierarchy blends the geometry of **Plus Jakarta Sans** with the functional clarity of **DM Sans**.

### Font Pairing Logic
- **Headings & Primary Page Titles**: Rendered in `Plus Jakarta Sans` for an open, friendly travel aesthetic.
- **Body & Controls**: Rendered in `DM Sans` for high legibility at dense mobile viewing sizes.
- **Tabular Currency Figures (`amount-display`, `amount-md`)**: Rendered using `DM Sans` with CSS feature settings `font-variant-numeric: tabular-nums` (`"tnum" 1`) enabled. This ensures vertical alignment of decimal separators across dense transaction listings.

### Currency Formatting Rules
- Italian standard currency format: `12,50 €` (non-breaking space between numeric value and currency symbol).
- Debits prefix: `−12,50 €` (Unicode minus `U+2212`, avoiding standard hyphen-minus).
- Credits prefix: `+12,50 €`.
- Zero balance format: `0,00 €`.

## Layout & Spacing

A responsive grid guarantees effortless single-thumb access on mobile vacation setups and structured multi-column inspection on desktop devices.

### Grid System
- **Mobile (up to 767px)**: Single-column fluid view with `margin: 1rem` (16px) and `gutter: 1rem` (16px). Bottom safe area inset padding (`env(safe-area-inset-bottom)`) applied to accommodate fixed navigation bars.
- **Tablet (768px – 1023px)**: 8-column layout with `margin: 1.5rem` (24px) and `gutter: 1rem` (16px).
- **Desktop (1024px and up)**: 12-column layout max-width clamped to 1180px with `margin: 2.5rem` (40px) and `gutter: 1.5rem` (24px). Sidebar takes 3 columns (fixed 260px); main operational view occupies remaining 9 columns.

### Density & Touch Targets
- Minimum touch area across all interactives (pills, menu triggers, inputs, checkboxes) is **44px × 44px**.
- Card interior padding is fixed to `space-md` (16px) on mobile viewports and escalates to `space-lg` (24px) on tablet and desktop.

## Elevation & Depth

This design system avoids dark drop shadows, using warm ambient diffusion and fine structural outlines to evoke tactile stationery.

### Ambient Warm Elevation Levels
- **Level 0 (Flat)**: Background `#FBF9F5` canvas; standard static content partitions.
- **Level 1 (Card Default)**: Surface `#FFFFFF` paired with border `1px solid #EBE5DF` and soft ambient shadow: `0 2px 8px -2px rgba(92, 70, 48, 0.05), 0 1px 3px 0 rgba(92, 70, 48, 0.03)`.
- **Level 2 (Hover / Floating Controls)**: Interactive cards on hover and bottom bars: `0 8px 24px -4px rgba(92, 70, 48, 0.08), 0 2px 6px -1px rgba(92, 70, 48, 0.04)`.
- **Level 3 (Modals & Overlays)**: Expense entry sheets and settlement panels: `0 16px 40px -6px rgba(45, 34, 24, 0.12), 0 4px 12px 0 rgba(45, 34, 24, 0.06)`.

### Border Integrity
Every elevated card, sheet, and floating element pairs its drop shadow with a `1px solid #EBE5DF` border to maintain edge clarity on low-brightness mobile displays.

## Shapes

The design system uses geometry level `2` (0.5rem / 8px baseline) calibrated to 12px (`0.75rem`) for cards, matching modern iOS and Android surface conventions.

### Shape Hierarchy
- **Cards & Summary Containers**: Fixed to `12px` (`0.75rem`).
- **Inputs & Textareas**: Fixed to `10px` (`0.625rem`) for crisp form containment.
- **Buttons & Floating Triggers**: `10px` for standard controls; `9999px` (full pill) for interactive filtering chips, notification badges, and floating action buttons.
- **Sheet Drawers (Mobile Bottom Sheet)**: `20px 20px 0 0` on top corners.

## Components

### Buttons
- **Primary Action**: Background `#1B8375`, text `#FFFFFF`, font `Plus Jakarta Sans` semi-bold (weight 600), height 48px, radius 10px. Hover: `#156E62`. Focus visible: 2px solid `#FFFFFF` offset + 2px solid `#1B8375`.
- **Secondary Action**: Background `#FFFFFF`, border `1.5px solid #EBE5DF`, text `#2A303A`. Hover: background `#FBF9F5`, border `#D9D0C7`.
- **Ghost Action**: Background transparent, text `#1B8375`, height 44px. Hover: background `#E4F2EF`.

### Expense Cards (`Spesa`)
- Surface `#FFFFFF`, border `1px solid #EBE5DF`, radius 12px, padding 16px.
- Left slot: Circular category avatar (40px, background `#F4EFEA`, icon `#5C6470`).
- Central block: Title in `Plus Jakarta Sans` 15px (e.g., "Cena Trattoria"), sub-line in `DM Sans` 13px (`Pagato da Marco • Per 4 persone`).
- Right slot: Tabular numeric readout (`amount-md`). Below amount, render allocation micro-tag: `La tua quota: 18,50 €`.

### Balance Badges (`Saldi`)
- High-contrast pill containers incorporating dual-encoding (sign + icon + text).
- **Surplus**: Background `#EAF5ED`, border `1px solid #C4E5CC`, text `#1E7E34`. Render: `+ 45,00 € (devi ricevere)`.
- **Deficit**: Background `#FBECE8`, border `1px solid #F5CCC4`, text `#C84B31`. Render: `− 32,50 € (devi dare)`.
- **Settled**: Background `#F3F4F6`, border `1px solid #E5E7EB`, text `#5C6470`. Render: `0,00 € (in pari)`.

### Input Fields & Selects
- Height 48px, background `#FFFFFF`, border `1.5px solid #EBE5DF`, radius 10px, padding `0 14px`.
- Text size 15px with placeholder color `#8C939E`.
- Focus ring: Border color `#1B8375`, box shadow `0 0 0 3px rgba(27, 131, 117, 0.15)`.

### Notice Banner: Server Wakeup (`Stato Server`)
- Purpose: Alerts user to server warm-up periods (Render/Fly/Heroku cold starts).
- Layout: Full width or floating card at the viewport top, background `#FAF3E0`, border `1px solid #F0E0B8`, radius 12px, padding 12px 16px.
- Content: Subtle spinning warm amber indicator (16px), text `Il server si sta svegliando… Un attimo di pazienza per il caricamento dei dati.` in font `DM Sans` 13px bold `#7A5210`.

### Navigation Architecture
- **Mobile Bottom Navigation Bar**:
  - Sticky at viewport base, height 64px + safe area padding, background `rgba(255, 255, 255, 0.94)`, backdrop filter `blur(12px)`, top border `1px solid #EBE5DF`.
  - Active tab items: Icon + text in `#1B8375` (`Panoramica`, `Spese`, `Saldi`).
  - Disabled / Placeholder items: Icon + text in `#B4BAC4` with tooltip/badge `Prossimamente` (`Liste`, `Foto`).
- **Desktop Sidebar Variant**:
  - Left pinned 260px wide, height 100vh, background `#FFFFFF`, right border `1px solid #EBE5DF`, vertical stack layout.
  - Header: Trip selector dropdown with holiday pin icon.
  - Nav stack items: Height 44px, radius 8px, padding `0 12px`, active background `#E4F2EF`, active text `#156E62`.