import { createContext } from 'react'

export type LiveStatus = 'connecting' | 'connected' | 'offline'
export type LiveContextValue = {
  status: LiveStatus
  /** Restituisce la funzione per disiscriversi. */
  subscribe: (destination: string, onMessage: (body: unknown) => void) => () => void
  publish: (destination: string) => void
}

/** Senza provider (test, utente non loggato) il canale è spento: la app funziona col REST e il polling. */
export const LiveContext = createContext<LiveContextValue>({ status: 'offline', subscribe: () => () => {}, publish: () => {} })
