import { useQueryClient } from '@tanstack/react-query'
import { persistQueryClientRestore, persistQueryClientSubscribe } from '@tanstack/react-query-persist-client'
import { useEffect, useState, type ReactNode } from 'react'
import { useAuth } from '../auth/useAuth'
import { busterFor, MAX_AGE, persister, shouldPersist, storageGate } from './persistence'

/**
 * Per l'utente che ha fatto l'accesso: prima ripristina la copia salvata sul telefono, poi la tiene aggiornata (D-63).
 * Il marchio contiene l'id: la copia di un'altra persona si scarta invece di comparire. Senza accesso non salva nulla.
 */
export function DevicePersistence({ children }: { children: ReactNode }) {
  const { auth } = useAuth()
  const client = useQueryClient()
  const userId = auth?.user.id
  const [restoredFor, setRestoredFor] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) return
    let alive = true
    let unsubscribe = () => {}
    const buster = busterFor(userId)
    persistQueryClientRestore({ queryClient: client, persister, buster, maxAge: MAX_AGE })
      .catch(() => console.warn('Copia offline non disponibile su questo dispositivo'))   // IndexedDB assente o piena: si va avanti online
      .finally(() => {
        if (!alive) return
        storageGate.open()   // chiusa dall'ultima uscita: si riapre per chi è appena entrato
        unsubscribe = persistQueryClientSubscribe({ queryClient: client, persister, buster, dehydrateOptions: { shouldDehydrateQuery: shouldPersist } })
        setRestoredFor(userId)
      })
    return () => { alive = false; unsubscribe() }
  }, [client, userId])

  if (userId && restoredFor !== userId) return null   // pochi millisecondi: niente richieste prima del ripristino
  return children
}
