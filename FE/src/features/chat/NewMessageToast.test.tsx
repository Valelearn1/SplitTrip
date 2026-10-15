import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { beforeEach, expect, it, vi } from 'vitest'
import type { ChatMessage } from '../../shared/api/types'
import { LiveContext } from '../../shared/live/liveContext'
import { renderWithProviders } from '../../test/renderWithProviders'
import { server } from '../../test/server'
import { AUTH_STORAGE_KEY } from '../auth/authContext'
import { TripLayout } from '../trips/TripLayout'

const sound = vi.hoisted(() => ({ playChime: vi.fn() }))
vi.mock('../../shared/live/sound', async (orig) => ({ ...(await orig<typeof import('../../shared/live/sound')>()), playChime: sound.playChime }))

const trip = {
  id: 't1', name: 'Roma', destination: 'Roma', startDate: '2026-11-01', endDate: '2026-11-05', currency: 'EUR', status: 'ONGOING',
  inviteCode: 'ROMA-7K2P', ownerId: 'u1',
  participants: [
    { id: 'p1', userId: 'u1', displayName: 'Vale', role: 'ORGANIZER', defaultWeight: 1, arrivalDate: null, departureDate: null, hasAvatar: false },
    { id: 'p2', userId: 'u2', displayName: 'Marco', role: 'MEMBER', defaultWeight: 1, arrivalDate: null, departureDate: null, hasAvatar: false },
  ],
}
const msg = (over: Partial<ChatMessage>): ChatMessage => ({
  id: 'x', kind: 'TEXT', authorParticipantId: 'p2', authorName: 'Marco', authorUserId: 'u2', authorHasAvatar: false,
  content: 'Sono in ritardo', eventType: null, refId: null, createdAt: new Date().toISOString(), deleted: false, reactions: [], ...over,
})
const listeners = new Set<(b: unknown) => void>()
const push = (b: unknown) => listeners.forEach((l) => l(b))
const live = { status: 'connected' as const, publish: () => {}, subscribe: (_d: string, cb: (b: unknown) => void) => { listeners.add(cb); return () => { listeners.delete(cb) } } }

beforeEach(() => {
  sound.playChime.mockClear()
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: 't', user: { id: 'u1', email: 'v@e.it', displayName: 'Vale', hasAvatar: false } }))
  server.use(
    http.get('http://localhost/api/trips/t1', () => HttpResponse.json(trip)),
    http.get('http://localhost/api/trips/t1/balances', () => HttpResponse.json({ balances: [], suggestedTransfers: [] })),
    http.get('http://localhost/api/trips/t1/messages/unread-count', () => HttpResponse.json({ count: 0 })),
  )
})

it('fuori dalla chat un messaggio altrui suona e mostra un avviso con il link alla chat', async () => {
  renderWithProviders([{ path: '/trips/:tripId', element: <LiveContext value={live}><TripLayout /></LiveContext>, children: [{ index: true, element: <p>Pagina panoramica</p> }] }], '/trips/t1')
  await screen.findByText('Pagina panoramica')
  act(() => push({ type: 'message.created', data: msg({ id: 'n1' }) }))
  const toast = await screen.findByRole('status', { name: 'Nuovo messaggio' })
  expect(toast).toHaveTextContent('Marco: Sono in ritardo')
  expect(screen.getByRole('link', { name: 'Apri la chat' })).toHaveAttribute('href', '/trips/t1/chat')
  expect(sound.playChime).toHaveBeenCalledTimes(1)
  await userEvent.setup().click(screen.getByRole('button', { name: 'Chiudi l\'avviso' }))
  expect(screen.queryByRole('status', { name: 'Nuovo messaggio' })).not.toBeInTheDocument()
})

it('i miei messaggi e le righe evento non suonano e non mostrano avvisi', async () => {
  renderWithProviders([{ path: '/trips/:tripId', element: <LiveContext value={live}><TripLayout /></LiveContext>, children: [{ index: true, element: <p>Pagina panoramica</p> }] }], '/trips/t1')
  await screen.findByText('Pagina panoramica')
  act(() => push({ type: 'message.created', data: msg({ id: 'm1', authorParticipantId: 'p1', authorName: 'Vale', authorUserId: 'u1' }) }))
  act(() => push({ type: 'message.created', data: msg({ id: 'e1', kind: 'EVENT', authorParticipantId: null, authorName: null, content: 'Marco ha aggiunto «Cena» · 45,00 €' }) }))
  expect(screen.queryByRole('status', { name: 'Nuovo messaggio' })).not.toBeInTheDocument()
  expect(sound.playChime).not.toHaveBeenCalled()
})
