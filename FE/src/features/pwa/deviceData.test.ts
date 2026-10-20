import { QueryClient } from '@tanstack/react-query'
import { expect, it, vi } from 'vitest'
import { clearDeviceData } from './deviceData'
import { storageGate } from './persistence'

it('svuota memoria, copia in IndexedDB e cache delle immagini', async () => {
  const client = new QueryClient()
  client.setQueryData(['trips'], [{ id: 't1' }])
  const persister = { persistClient: vi.fn(), restoreClient: vi.fn(), removeClient: vi.fn(async () => {}) }
  const caches = { delete: vi.fn(async () => true) } as unknown as CacheStorage
  const indexedDB = { deleteDatabase: vi.fn() }
  await clearDeviceData(client, { persister, caches, indexedDB })
  expect(client.getQueryData(['trips'])).toBeUndefined()
  expect(indexedDB.deleteDatabase).toHaveBeenCalledWith('workbox-expiration')   // gli indirizzi delle immagini restavano lì
  expect(persister.removeClient).toHaveBeenCalled()
  expect(caches.delete).toHaveBeenCalledWith('splittrip-foto')
  expect(caches.delete).toHaveBeenCalledWith('splittrip-avatar')
  expect(storageGate.isOpen()).toBe(false)   // un salvataggio già programmato non riscrive i dati appena cancellati
  storageGate.open()
})

it('senza Cache API (browser vecchi, test) non si blocca', async () => {
  const persister = { persistClient: vi.fn(), restoreClient: vi.fn(), removeClient: vi.fn(async () => {}) }
  await expect(clearDeviceData(new QueryClient(), { persister, caches: undefined })).resolves.toBeUndefined()
})

it('IndexedDB assente o bloccata: le immagini si cancellano comunque e l\'uscita non si rompe', async () => {
  const persister = { persistClient: vi.fn(), restoreClient: vi.fn(), removeClient: vi.fn(async () => { throw new ReferenceError('indexedDB is not defined') }) }
  const caches = { delete: vi.fn(async () => true) } as unknown as CacheStorage
  await expect(clearDeviceData(new QueryClient(), { persister, caches })).resolves.toBeUndefined()
  expect(caches.delete).toHaveBeenCalledWith('splittrip-foto')
  storageGate.open()
})
