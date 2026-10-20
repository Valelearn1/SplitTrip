import type { QueryClient } from '@tanstack/react-query'
import type { Persister } from '@tanstack/react-query-persist-client'
import { persister as defaultPersister, storageGate } from './persistence'

const IMAGE_CACHES = ['splittrip-foto', 'splittrip-avatar']

/** All'uscita dall'account sul telefono non resta niente (D-63): memoria, copia in IndexedDB, immagini salvate. */
export async function clearDeviceData(
  client: QueryClient,
  deps: { persister: Persister; caches?: CacheStorage; indexedDB?: { deleteDatabase(name: string): unknown } } = { persister: defaultPersister, caches: globalThis.caches, indexedDB: globalThis.indexedDB },
): Promise<void> {
  storageGate.close()   // prima di tutto: niente salvataggi in ritardo dopo la cancellazione
  client.clear()
  // ogni pezzo per conto suo: se IndexedDB è bloccata (alcune finestre private) le immagini si cancellano comunque
  try {
    await deps.persister.removeClient()   // può anche lanciare subito (IndexedDB assente), non solo rifiutare
  } catch {
    console.warn('Copia offline non cancellabile su questo dispositivo')
  }
  if (deps.caches) await Promise.all(IMAGE_CACHES.map((name) => deps.caches!.delete(name).catch(() => false)))
  try {
    deps.indexedDB?.deleteDatabase('workbox-expiration')   // l'archivio interno di Workbox tiene gli indirizzi delle immagini
  } catch { /* bloccata: non resta altro da fare */ }
}
