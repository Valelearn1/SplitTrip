import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { expect, it } from 'vitest'
import { manifest } from './manifest'

it('il manifest rende SplitTrip installabile: nome, schermo intero, partenza dalla Home', () => {
  expect(manifest.name).toBe('SplitTrip')
  expect(manifest.short_name).toBe('SplitTrip')
  expect(manifest.lang).toBe('it')
  expect(manifest.display).toBe('standalone')
  expect(manifest.start_url).toBe('/')
  expect(manifest.theme_color).toBe('#2347b8')
  expect(manifest.background_color).toBe('#f8f9ff')
})

it('le icone 192, 512 e maskable esistono davvero in public/', () => {
  const icons = manifest.icons ?? []
  expect(icons.map((i) => i.sizes)).toEqual(expect.arrayContaining(['192x192', '512x512']))
  expect(icons.some((i) => i.purpose === 'maskable')).toBe(true)
  for (const icon of icons) expect(existsSync(resolve(process.cwd(), 'public', icon.src))).toBe(true)
  expect(existsSync(resolve(process.cwd(), 'public', 'apple-touch-icon.png'))).toBe(true)
})

it('index.html dichiara l\'app anche col meta non solo-Apple', () => {
  const html = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8')
  expect(html).toContain('<meta name="mobile-web-app-capable" content="yes" />')
})
