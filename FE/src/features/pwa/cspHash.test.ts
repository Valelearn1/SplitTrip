import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { expect, it } from 'vitest'

it('l\'hash nella CSP corrisponde allo script del tema in index.html (cambiare lo script senza aggiornarlo rompe il sito)', () => {
  const html = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8')
  const inline = html.match(/<script>([\s\S]*?)<\/script>/)?.[1] ?? ''
  const hash = createHash('sha256').update(inline, 'utf8').digest('base64')
  const yaml = readFileSync(resolve(process.cwd(), '../render.yaml'), 'utf8')
  expect(yaml).toContain(`'sha256-${hash}'`)
})
