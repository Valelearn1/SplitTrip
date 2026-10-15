import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, it, vi } from 'vitest'
import { AuthProvider } from '../../features/auth/AuthProvider'
import { AUTH_STORAGE_KEY } from '../../features/auth/authContext'
import { useAuth } from '../../features/auth/useAuth'
import { LiveProvider } from './LiveProvider'
import { useLiveStatus, useTripChannel } from './useLive'

type Cfg = { brokerURL: string; connectHeaders: Record<string, string>; onConnect?: () => void; onStompError?: (f: { headers: Record<string, string> }) => void; onWebSocketClose?: () => void }
const fake = vi.hoisted(() => ({ clients: [] as FakeClient[] }))
type FakeClient = { config: Cfg; connected: boolean; subs: Map<string, (f: { body: string }) => void>; activate: ReturnType<typeof vi.fn>; deactivate: ReturnType<typeof vi.fn>; subscribe: ReturnType<typeof vi.fn>; connect(): void; drop(): void; emit(d: string, body: unknown): void }

vi.mock('@stomp/stompjs', () => {
  class Client {
    connected = false
    subs = new Map<string, (f: { body: string }) => void>()
    activate = vi.fn()
    deactivate = vi.fn(async () => {})
    subscribe = vi.fn((d: string, cb: (f: { body: string }) => void) => { this.subs.set(d, cb); return { unsubscribe: vi.fn(() => this.subs.delete(d)) } })
    publish = vi.fn()
    config: Cfg
    constructor(config: Cfg) { this.config = config; fake.clients.push(this as unknown as FakeClient) }
    connect() { this.connected = true; this.config.onConnect?.() }
    drop() { this.connected = false; this.subs.clear(); this.config.onWebSocketClose?.() }
    emit(d: string, body: unknown) { this.subs.get(d)?.({ body: JSON.stringify(body) }) }
  }
  return { Client, ReconnectionTimeMode: { LINEAR: 0, EXPONENTIAL: 1 } }
})

function Probe({ onEvent }: { onEvent: (e: unknown) => void }) {
  const status = useLiveStatus()
  const { logout } = useAuth()
  useTripChannel('t1', onEvent)
  return <><span>stato: {status}</span><button onClick={logout}>esci</button></>
}

function setup(onEvent = vi.fn()) {
  const qc = new QueryClient()
  const invalidate = vi.spyOn(qc, 'invalidateQueries')
  render(<QueryClientProvider client={qc}><AuthProvider><LiveProvider><Probe onEvent={onEvent} /></LiveProvider></AuthProvider></QueryClientProvider>)
  return { invalidate, onEvent, client: () => fake.clients.at(-1)! }
}

beforeEach(() => {
  fake.clients.length = 0
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: 'jwt-1', user: { id: 'u1', email: 'v@e.it', displayName: 'Vale', hasAvatar: false } }))
})

it('si collega col token nel CONNECT e consegna gli eventi del viaggio', () => {
  const { onEvent, client } = setup()
  expect(client().config.connectHeaders).toEqual({ Authorization: 'Bearer jwt-1' })
  expect(client().activate).toHaveBeenCalled()
  act(() => client().connect())
  expect(screen.getByText('stato: connected')).toBeInTheDocument()
  expect(client().subscribe).toHaveBeenCalledWith('/topic/trips/t1', expect.any(Function))
  act(() => client().emit('/topic/trips/t1', { type: 'typing', data: { participantId: 'p2', name: 'Marco' } }))
  expect(onEvent).toHaveBeenCalledWith({ type: 'typing', data: { participantId: 'p2', name: 'Marco' } })
})

it('dopo una riconnessione ri-sottoscrive e ricarica chat e notifiche (Review Focus 4)', () => {
  const { invalidate, client } = setup()
  act(() => client().connect())
  expect(invalidate).not.toHaveBeenCalled()
  act(() => client().drop())
  expect(screen.getByText('stato: connecting')).toBeInTheDocument()
  act(() => client().connect())
  expect(client().subscribe).toHaveBeenCalledTimes(2)
  expect(invalidate).toHaveBeenCalledWith({ queryKey: ['chat'] })
  expect(invalidate).toHaveBeenCalledWith({ queryKey: ['notifications'] })
})

it('una destinazione rifiutata non si ritenta (Review Focus 1)', () => {
  const { client } = setup()
  act(() => client().connect())
  act(() => client().config.onStompError?.({ headers: { message: 'Destinazione non permessa: /topic/trips/t1' } }))
  act(() => client().drop())
  act(() => client().connect())
  expect(client().subscribe).toHaveBeenCalledTimes(1)
})

it('al logout il client si disattiva (Review Focus 3)', async () => {
  const { client } = setup()
  act(() => client().connect())
  await userEvent.setup().click(screen.getByRole('button', { name: 'esci' }))
  expect(client().deactivate).toHaveBeenCalled()
  expect(screen.getByText('stato: offline')).toBeInTheDocument()
})

it('un token rifiutato non si ritenta: il client si spegne e si torna al login', () => {
  const { client } = setup()
  act(() => client().config.onStompError?.({ headers: { message: 'Token non valido' } }))
  expect(client().deactivate).toHaveBeenCalled()
  expect(screen.getByText('stato: offline')).toBeInTheDocument()
  expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull()
})
