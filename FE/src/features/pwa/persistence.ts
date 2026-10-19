import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import type { Query } from '@tanstack/react-query'
import { del, get, set } from 'idb-keyval'

/** Da aumentare a mano quando cambia la forma dei dati dell'API: la copia vecchia sul telefono si scarta (D-63). */
export const CACHE_VERSION = 1
export const CACHE_KEY = 'splittrip-cache'
export const MAX_AGE = 7 * 24 * 60 * 60 * 1000

const PERSISTED = new Set(['home', 'trips', 'chat', 'notifications', 'me'])

/** Solo dati riusciti e utili offline: mai immagini (cache del service worker), AI, anteprime d'invito. */
export function shouldPersist(query: Query): boolean {
  const head = query.queryKey[0]
  return query.state.status === 'success' && typeof head === 'string' && PERSISTED.has(head)
}

export const busterFor = (userId: string) => `${CACHE_VERSION}:${userId}`

type Storage = {
  getItem: (key: string) => Promise<string | null>
  setItem: (key: string, value: string) => Promise<void>
  removeItem: (key: string) => Promise<void>
}

let open = true

/**
 * Porta delle scritture: chiusa all'uscita, riaperta dopo il ripristino di chi entra. Il persister salva al massimo una
 * volta al secondo, quindi un salvataggio già programmato può partire dopo la cancellazione: a porta chiusa non scrive.
 */
export const storageGate = { close: () => { open = false }, open: () => { open = true }, isOpen: () => open }

export function gatedStorage(inner: Storage): Storage {
  return {
    getItem: (k) => inner.getItem(k),
    setItem: (k, v) => (open ? inner.setItem(k, v) : Promise.resolve()),
    removeItem: (k) => inner.removeItem(k),
  }
}

export const persister = createAsyncStoragePersister({
  storage: gatedStorage({ getItem: (k) => get<string>(k).then((v) => v ?? null), setItem: (k, v) => set(k, v), removeItem: (k) => del(k) }),
  key: CACHE_KEY,
  throttleTime: 1000,
})
