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
