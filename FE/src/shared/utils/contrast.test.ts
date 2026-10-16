import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { expect, it } from 'vitest'
import { contrastRatio } from './contrast'

function tokens(block: string): Record<string, string> {
  const out: Record<string, string> = {}
  for (const m of block.matchAll(/--([a-z0-9-]+):\s*(#[0-9a-f]{6})/gi)) out[m[1]] = m[2].toLowerCase()
  return out
}
const ratio = contrastRatio

const css = readFileSync(resolve(process.cwd(), 'src/index.css'), 'utf8') // i test girano dalla cartella FE
const light = tokens(css.slice(css.indexOf(':root {'), css.indexOf('}', css.indexOf(':root {'))))
const darkStart = css.indexOf(':root[data-theme=\'dark\']')
const dark = { ...light, ...tokens(css.slice(darkStart, css.indexOf('}', darkStart))) }

// card e barre traslucide (D-58): il vetro mescolato col colore del disegno che le fa reggere peggio
function glass(block: string): [number, number, number, number] {
  const m = block.match(/--surface-glass:\s*rgba\(([^)]+)\)/)
  if (!m) throw new Error('--surface-glass mancante')
  return m[1].split(',').map(Number) as [number, number, number, number]
}
function over([r, g, b, a]: [number, number, number, number], backdrop: string) {
  const mix = (c: number, i: number) => Math.round(c * a + parseInt(backdrop.slice(i, i + 2), 16) * (1 - a))
  return '#' + [mix(r, 1), mix(g, 3), mix(b, 5)].map((v) => v.toString(16).padStart(2, '0')).join('')
}
const lightGlass = glass(css.slice(css.indexOf(':root {'), css.indexOf('}', css.indexOf(':root {'))))
const darkGlass = glass(css.slice(darkStart, css.indexOf('}', darkStart)))

// coppie testo/fondo che compaiono nell'app: ognuna deve reggere l'AA (4,5:1)
const PAIRS: [string, string][] = [['ink', 'bg'], ['ink', 'surface'], ['ink-2', 'surface'], ['ink-3', 'surface'], ['accent', 'surface'], ['accent', 'accent-tint'], ['negative', 'surface'], ['negative', 'negative-tint'], ['amber', 'amber-tint'], ['ink', 'surface-1'],
  // testo sopra i colori pieni (bottoni, chip attivi, contatori, hover): bianco nel chiaro, blu notte nello scuro
  ['on-accent', 'accent'], ['on-accent', 'accent-2'], ['on-accent', 'negative']]

it('il tema scuro ha i suoi token', () => {
  expect(darkStart).toBeGreaterThan(0)
  for (const k of ['bg', 'surface', 'ink', 'accent', 'negative']) expect(dark[k], k).not.toBe(light[k])
})

it.each([['chiaro', light], ['scuro', dark]] as const)('i token del tema %s reggono il contrasto AA', (_, t) => {
  for (const [fg, bg] of PAIRS) expect(ratio(t[fg], t[bg]), `${fg} su ${bg}`).toBeGreaterThanOrEqual(4.5)
})

it.each([['chiaro', light, lightGlass, '#5b3a32'], ['scuro', dark, darkGlass, '#ffffff']] as const)('sul vetro del tema %s il testo regge anche sopra il disegno', (_, t, g, worst) => {
  const bg = over(g, worst)
  for (const fg of ['ink', 'ink-3', 'accent', 'negative']) expect(ratio(t[fg], bg), `${fg} sul vetro`).toBeGreaterThanOrEqual(4.5)
})
