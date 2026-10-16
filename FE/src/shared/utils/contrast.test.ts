import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { expect, it } from 'vitest'

function tokens(block: string): Record<string, string> {
  const out: Record<string, string> = {}
  for (const m of block.matchAll(/--([a-z0-9-]+):\s*(#[0-9a-f]{6})/gi)) out[m[1]] = m[2].toLowerCase()
  return out
}
function luminance(hex: string) {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
}
const ratio = (a: string, b: string) => { const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x); return (l1 + 0.05) / (l2 + 0.05) }

const css = readFileSync(resolve(process.cwd(), 'src/index.css'), 'utf8') // i test girano dalla cartella FE
const light = tokens(css.slice(css.indexOf(':root {'), css.indexOf('}', css.indexOf(':root {'))))
const darkStart = css.indexOf(':root[data-theme=\'dark\']')
const dark = { ...light, ...tokens(css.slice(darkStart, css.indexOf('}', darkStart))) }

// coppie testo/fondo che compaiono nell'app: ognuna deve reggere l'AA (4,5:1)
const PAIRS: [string, string][] = [['ink', 'bg'], ['ink', 'surface'], ['ink-2', 'surface'], ['ink-3', 'surface'], ['teal', 'surface'], ['teal', 'teal-tint'], ['coral', 'surface'], ['coral', 'coral-tint'], ['amber', 'amber-tint'], ['ink', 'surface-1'],
  // testo sopra i colori pieni (bottoni, chip attivi, contatori): bianco nel chiaro, blu notte nello scuro
  ['on-accent', 'teal'], ['on-accent', 'coral']]

it('il tema scuro ha i suoi token', () => {
  expect(darkStart).toBeGreaterThan(0)
  for (const k of ['bg', 'surface', 'ink', 'teal', 'coral']) expect(dark[k], k).not.toBe(light[k])
})

it.each([['chiaro', light], ['scuro', dark]] as const)('i token del tema %s reggono il contrasto AA', (_, t) => {
  for (const [fg, bg] of PAIRS) expect(ratio(t[fg], t[bg]), `${fg} su ${bg}`).toBeGreaterThanOrEqual(4.5)
})
