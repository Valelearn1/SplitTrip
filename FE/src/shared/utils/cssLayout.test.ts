import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { expect, it } from 'vitest'

// jsdom non impagina: queste regole sono quelle che tengono le pagine dentro un telefono da 360–430 px
const css = readFileSync(resolve(process.cwd(), 'src/index.css'), 'utf8') // i test girano dalla cartella FE
const rule = (selector: string) => {
  const at = css.indexOf(`\n${selector} {`)
  if (at < 0) throw new Error(`regola ${selector} mancante`)
  return css.slice(at, css.indexOf('}', at))
}

it('le colonne delle pagine non si allargano oltre lo schermo per un contenuto lungo', () => {
  expect(rule('.stack')).toContain('grid-template-columns: minmax(0, 1fr)')
})

it('i badge si dividono lo spazio e i nomi lunghi vanno a capo', () => {
  expect(rule('.badge-grid')).toContain('grid-template-columns: repeat(2, minmax(0, 1fr))')
  expect(rule('.badge-name')).toMatch(/min-width: 0;.*overflow-wrap: anywhere/)
  expect(rule('.podium li')).toMatch(/min-width: 0;.*overflow-wrap: anywhere/)
  expect(rule('.podium-rest li')).toContain('gap:')
})

it('una miniatura da 300 px nei «momenti» del riepilogo non allarga la pagina (a 430 px la pagina si zoomava)', () => {
  expect(rule('.photo-grid')).toContain('grid-template-columns: repeat(3, minmax(0, 1fr))')
  expect(rule('.wrapped-moments img, .wrapped-moments .img-placeholder')).toMatch(/width: 100%.*aspect-ratio: 1.*object-fit: cover/)
})

it('una nota sotto un riquadro ha spazio sopra (la regola .hint si tira su per stare sotto un campo)', () => {
  expect(rule('.kv-note')).toContain('margin: var(--space-3) 0 0')
})

it('la barra «Aggiorna» ha bottoni da 44 px e lascia spazio al «+»; l\'avviso sta sopra il «+»', () => {
  expect(rule('.update-banner .btn')).toContain('min-height: 44px')
  expect(rule('.update-banner')).toContain('right: 96px')
  expect(rule('.update-banner')).toContain('flex-direction: column')
  expect(rule('.update-banner .ub-actions')).toContain('justify-content: space-between')
  expect(rule('.update-banner .ub-actions')).toContain('flex-wrap: wrap')   // testo grande a 320 px: «Dopo» va sotto invece di uscire
  expect(rule('.network-toast')).toContain('bottom: 96px')
})

it('niente più verde acqua del vecchio tema', () => {
  expect(css).not.toContain('0, 104, 92')
})

it('sotto i 360 px il nome accanto al logo si nasconde alla vista ma resta per i lettori di schermo (D-65)', () => {
  const narrow = css.match(/@media \(max-width: 359px\) \{([\s\S]*?)\n\}/)
  expect(narrow?.[1]).toMatch(/\.brand-name \{[^}]*clip: rect\(0 0 0 0\)/)
})

it('a 320 px «Crea l\'immagine per le storie» va a capo invece di uscire dalla card (D-65)', () => {
  expect(rule('.wrapped-end')).toContain('grid-template-columns: minmax(0, 1fr)')
  expect(rule('.story-image')).toContain('grid-template-columns: minmax(0, 1fr)')
  expect(rule('.story-image .btn')).toContain('white-space: normal')
})

it('il titolo della pagina e il suo bottone vanno a capo se non ci stanno (Notifiche a 320 px, D-65)', () => {
  expect(rule('.page-head')).toContain('flex-wrap: wrap')
})
