import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { expect, it } from 'vitest'

// La CSP del sito vale anche per sw.js: le fetch del service worker passano da connect-src (revisione finale v3.5)
const renderYaml = readFileSync(resolve(process.cwd(), '../render.yaml'), 'utf8')
const csp = renderYaml.match(/name: Content-Security-Policy\s+value: "([^"]+)"/)?.[1] ?? ''
const connectSrc = csp.split(';').map((d) => d.trim()).find((d) => d.startsWith('connect-src')) ?? ''

it('il service worker può scaricare i font che mette in cache (altrimenti le icone diventano parole)', () => {
  expect(connectSrc).toContain('https://fonts.googleapis.com')
  expect(connectSrc).toContain('https://fonts.gstatic.com')
})

it('e può ancora parlare con l\'API e col canale live', () => {
  expect(connectSrc).toContain('https://splittrip-api.onrender.com')
  expect(connectSrc).toContain('wss://splittrip-api.onrender.com')
})

it('il manifest arriva col suo Content-Type', () => {
  expect(renderYaml).toMatch(/path: \/manifest\.webmanifest\s+name: Content-Type\s+value: application\/manifest\+json/)
})
