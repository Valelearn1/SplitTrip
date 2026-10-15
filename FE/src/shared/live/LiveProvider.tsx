import { Client, ReconnectionTimeMode, type StompSubscription } from '@stomp/stompjs'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useAuth } from '../../features/auth/useAuth'
import { LiveContext, type LiveStatus } from './liveContext'
import { wsUrl } from './wsUrl'

/**
 * Un solo client STOMP per sessione (D-39): si apre col login, si chiude al logout.
 * Le sottoscrizioni sono un registro: a ogni (ri)connessione si rifanno, tranne quelle rifiutate dal server.
 */
export function LiveProvider({ children }: { children: ReactNode }) {
  const { auth, logout } = useAuth()
  const token = auth?.token ?? null
  const queryClient = useQueryClient()
  const [connState, setConnState] = useState<Exclude<LiveStatus, 'offline'>>('connecting')
  const client = useRef<Client | null>(null)
  const handlers = useRef(new Map<string, Set<(body: unknown) => void>>())
  const active = useRef(new Map<string, StompSubscription>())
  const denied = useRef(new Set<string>())

  const attach = useCallback((destination: string) => {
    const c = client.current
    if (!c?.connected || active.current.has(destination) || denied.current.has(destination)) return
    active.current.set(destination, c.subscribe(destination, (frame) => {
      const body: unknown = JSON.parse(frame.body)
      handlers.current.get(destination)?.forEach((h) => h(body))
    }))
  }, [])

  useEffect(() => {
    if (!token) return
    const subscriptions = active.current // la mappa è sempre la stessa: la copia serve alla regola della lint
    let connectedBefore = false
    denied.current = new Set()
    const c = new Client({
      brokerURL: wsUrl(),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5_000,
      maxReconnectDelay: 60_000,
      reconnectTimeMode: ReconnectionTimeMode.EXPONENTIAL,
      heartbeatIncoming: 10_000,
      heartbeatOutgoing: 10_000,
      onConnect: () => {
        setConnState('connected')
        subscriptions.clear()
        handlers.current.forEach((_, destination) => attach(destination))
        // dopo un risveglio di Render: si ricarica ciò che è arrivato mentre eravamo scollegati
        if (connectedBefore) {
          void queryClient.invalidateQueries({ queryKey: ['chat'] })
          void queryClient.invalidateQueries({ queryKey: ['notifications'] })
        }
        connectedBefore = true
      },
      onStompError: (frame) => {
        const message = frame.headers.message ?? ''
        const match = /Destinazione non permessa: (\S+)/.exec(message)
        if (match) denied.current.add(match[1])
        // token scaduto o non valido: riprovare non serve (e riempirebbe i log del server); si torna al login
        if (message.startsWith('Token')) {
          void c.deactivate()
          logout()
        }
      },
      onWebSocketClose: () => {
        subscriptions.clear()
        setConnState('connecting')
      },
    })
    client.current = c
    c.activate()
    return () => {
      client.current = null
      subscriptions.clear()
      void c.deactivate()
      setConnState('connecting')
    }
  }, [token, queryClient, attach, logout])

  const subscribe = useCallback((destination: string, onMessage: (body: unknown) => void) => {
    let set = handlers.current.get(destination)
    if (!set) {
      set = new Set()
      handlers.current.set(destination, set)
    }
    set.add(onMessage)
    attach(destination)
    return () => {
      set.delete(onMessage)
      if (set.size === 0) {
        handlers.current.delete(destination)
        active.current.get(destination)?.unsubscribe()
        active.current.delete(destination)
      }
    }
  }, [attach])

  const publish = useCallback((destination: string) => {
    if (client.current?.connected) client.current.publish({ destination, body: '' })
  }, [])

  const status: LiveStatus = token ? connState : 'offline'
  const value = useMemo(() => ({ status, subscribe, publish }), [status, subscribe, publish])
  return <LiveContext value={value}>{children}</LiveContext>
}
