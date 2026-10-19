import { QueryClient } from '@tanstack/react-query'
import { expect, it } from 'vitest'
import { busterFor, CACHE_VERSION, gatedStorage, shouldPersist, storageGate } from './persistence'

const client = new QueryClient()
const query = (key: unknown[], ok = true) => {
  if (ok) client.setQueryData(key, { x: 1 })
  else client.getQueryCache().build(client, { queryKey: key })
  return client.getQueryCache().find({ queryKey: key })!
}

it('si salvano Home, viaggi, chat, notifiche e profilo riusciti', () => {
  for (const key of [['home'], ['trips', 't1', 'expenses', 'all'], ['chat', 't1', 'messages'], ['notifications'], ['me', 'stats']]) {
    expect(shouldPersist(query(key))).toBe(true)
  }
})

it('mai immagini, consigli AI, anteprime d\'invito o query senza dati', () => {
  expect(shouldPersist(query(['blob', '/trips/t1/photos/p1/image']))).toBe(false)
  expect(shouldPersist(query(['ai', 't1', 'tips']))).toBe(false)
  expect(shouldPersist(query(['join-preview', 'ROMA-7K2P']))).toBe(false)
  expect(shouldPersist(query(['trips', 't9'], false))).toBe(false)
})

it('il marchio contiene versione e persona: chi entra dopo non ritrova i dati di chi è uscito', () => {
  expect(busterFor('u1')).toBe(`${CACHE_VERSION}:u1`)
  expect(busterFor('u1')).not.toBe(busterFor('u2'))
})

it('a porta chiusa (dopo l\'uscita) un salvataggio in ritardo non scrive niente; riaperta, sì', async () => {
  const map = new Map<string, string>()
  const storage = gatedStorage({ getItem: async (k) => map.get(k) ?? null, setItem: async (k, v) => { map.set(k, v) }, removeItem: async (k) => { map.delete(k) } })
  storageGate.close()
  await storage.setItem('splittrip-cache', 'dati di prima')
  expect(map.has('splittrip-cache')).toBe(false)
  storageGate.open()
  await storage.setItem('splittrip-cache', 'dati nuovi')
  expect(map.get('splittrip-cache')).toBe('dati nuovi')
})
