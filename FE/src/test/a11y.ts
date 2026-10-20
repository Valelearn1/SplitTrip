import axe from 'axe-core'
import { expect } from 'vitest'

/** WCAG 2.2 A/AA con axe (D-65). Il contrasto lo verifica già il test sui token: jsdom non impagina. */
export async function expectAccessible(root: Element = document.body) {
  const results = await axe.run(root, {
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
    rules: { 'color-contrast': { enabled: false } },
  })
  const found = results.violations.map((v) => `${v.id}: ${v.help} → ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`)
  expect(found, `violazioni di accessibilità:\n${found.join('\n')}`).toEqual([])
}
