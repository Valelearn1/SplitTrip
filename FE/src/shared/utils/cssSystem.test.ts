import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { expect, it } from 'vitest'

// D-65: l'app segue le impostazioni del sistema; jsdom non applica media query, quindi si controllano le regole
const css = readFileSync(resolve(process.cwd(), 'src/index.css'), 'utf8')
const block = (head: string) => {
  const at = css.indexOf(head)
  if (at < 0) throw new Error(`blocco ${head} mancante`)
  let depth = 0
  for (let i = css.indexOf('{', at); i < css.length; i++) {
    if (css[i] === '{') depth++
    if (css[i] === '}' && --depth === 0) return css.slice(at, i + 1)
  }
  throw new Error(`blocco ${head} non chiuso`)
}

it('la base del testo segue il browser (niente 16 px fissi) e nessun testo è in px', () => {
  expect(block(':root {')).toContain('font-size: 100%')
  expect(css).not.toMatch(/font-size:\s*\d+(\.\d+)?px/)
})

it('su iPhone la base segue Dynamic Type, ma non sul Mac (dove varrebbe 13 px)', () => {
  const ios = block('@supports (font: -apple-system-body) and (-webkit-touch-callout: none)')
  expect(ios).toContain('font: -apple-system-body')
  expect(ios).toContain('font-family: var(--font)')
})

it('con contrasto aumentato card piene, testo secondario più scuro, link sottolineati, anche nel tema scuro', () => {
  const more = block('@media (prefers-contrast: more)')
  expect(more).toContain('--surface-glass: var(--surface)')
  expect(more).toContain('--ink-3: var(--ink-2)')
  expect(more).toContain(":root[data-theme='dark']")
  expect(more).toMatch(/a \{[^}]*text-decoration: underline/)
  expect(more).toContain('--focus: 0 0 0 3px var(--bg), 0 0 0 7px var(--accent)')   // anello da 4 px anche per chip e interruttori
})

it('con i colori forzati bordi e focus di sistema e niente illustrazione', () => {
  const forced = block('@media (forced-colors: active)')
  expect(forced).toContain('outline: 3px solid Highlight')
  expect(forced).toMatch(/\.season-bg \{ display: none; \}/)
  expect(forced).toContain('CanvasText')
})

it('con i colori forzati chip scelti, persona scelta e interruttore si vedono, e il loro focus anche (D-65)', () => {
  const forced = block('@media (forced-colors: active)')
  expect(forced).toMatch(/\.chip:has\(input:checked\)[^{]*\{[^}]*forced-color-adjust: none;[^}]*background: Highlight;[^}]*color: HighlightText/)
  expect(forced).toMatch(/\.person-pick:has\(input:checked\) \.avatar[^{]*\{[^}]*background: Highlight/)
  expect(forced).toMatch(/\.chip:has\(input:focus-visible\)[^{]*\.switch:focus-visible[^{]*\{[^}]*outline: 3px solid Highlight/)
  expect(forced).toMatch(/\.switch\[aria-checked='true'\] \.switch-track[^{]*\{[^}]*background: Highlight/)
})

it('lo sfondo fisso non segue la barra del browser (100lvh) e sta su un livello suo: niente scatti scorrendo dal telefono', () => {
  const bg = block('.season-bg {')
  expect(bg).toContain('height: 100lvh')
  expect(bg).toContain('will-change: transform')
  expect(bg).not.toContain('inset: 0')
})
