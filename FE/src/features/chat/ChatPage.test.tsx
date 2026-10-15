import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { beforeEach, expect, it } from 'vitest'
import type { ChatMessage } from '../../shared/api/types'
import { LiveContext } from '../../shared/live/liveContext'
import { renderWithProviders } from '../../test/renderWithProviders'
import { server } from '../../test/server'
import { AUTH_STORAGE_KEY } from '../auth/authContext'
import { TripLayout } from '../trips/TripLayout'
import { ChatPage } from './ChatPage'

const trip = (status = 'ONGOING') => ({
  id: 't1', name: 'Roma', destination: 'Roma', startDate: '2026-11-01', endDate: '2026-11-05', currency: 'EUR', status,
  inviteCode: 'ROMA-7K2P', ownerId: 'u1',
  participants: [
    { id: 'p1', userId: 'u1', displayName: 'Vale', role: 'ORGANIZER', defaultWeight: 1, arrivalDate: null, departureDate: null, hasAvatar: false },
    { id: 'p2', userId: 'u2', displayName: 'Marco', role: 'MEMBER', defaultWeight: 1, arrivalDate: null, departureDate: null, hasAvatar: false },
  ],
})
const msg = (over: Partial<ChatMessage>): ChatMessage => ({
  id: 'x', kind: 'TEXT', authorParticipantId: 'p2', authorName: 'Marco', authorUserId: 'u2', authorHasAvatar: false,
  content: 'Ciao', eventType: null, refId: null, createdAt: new Date().toISOString(), deleted: false, ...over,
})

// TripLayout (sincronizza la cache) e ChatPage («sta scrivendo») si iscrivono entrambi: il canale finto consegna a tutti
const listeners = new Set<(b: unknown) => void>()
const push = (b: unknown) => listeners.forEach((l) => l(b))
const live = { status: 'connected' as const, publish: () => {}, subscribe: (_d: string, cb: (b: unknown) => void) => { listeners.add(cb); return () => { listeners.delete(cb) } } }
const sent: unknown[] = []

function mount(status = 'ONGOING', items: ChatMessage[] = []) {
  server.use(
    http.get('http://localhost/api/trips/t1', () => HttpResponse.json(trip(status))),
    http.get('http://localhost/api/trips/t1/balances', () => HttpResponse.json({ balances: [], suggestedTransfers: [] })),
    http.get('http://localhost/api/notifications/unread-count', () => HttpResponse.json({ count: 0 })),
    http.get('http://localhost/api/trips/t1/messages/unread-count', () => HttpResponse.json({ count: 0 })),
    http.post('http://localhost/api/trips/t1/messages/read', () => new HttpResponse(null, { status: 204 })),
    http.get('http://localhost/api/trips/t1/messages', () => HttpResponse.json({ items, hasMore: false })),
    http.post('http://localhost/api/trips/t1/messages', async ({ request }) => {
      const body = (await request.json()) as { content: string }
      sent.push(body)
      return HttpResponse.json(msg({ id: 'mine', authorParticipantId: 'p1', authorName: 'Vale', authorUserId: 'u1', content: body.content }), { status: 201 })
    }),
  )
  renderWithProviders([{ path: '/trips/:tripId', element: <LiveContext value={live}><TripLayout /></LiveContext>, children: [{ path: 'chat', element: <ChatPage /> }] }], '/trips/t1/chat')
}

beforeEach(() => {
  sent.length = 0
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: 't', user: { id: 'u1', email: 'v@e.it', displayName: 'Vale', hasAvatar: false } }))
})

it('mostra chi scrive, le righe evento con il link e i messaggi eliminati', async () => {
  mount('ONGOING', [
    msg({ id: 'm3', authorParticipantId: 'p1', authorName: 'Vale', authorUserId: 'u1', content: 'Arrivo alle 20' }),
    msg({ id: 'm2', deleted: true, content: null }),
    msg({ id: 'e1', kind: 'EVENT', authorParticipantId: null, authorName: null, authorUserId: null, content: 'Marco ha aggiunto «Cena» · 45,00 €', eventType: 'EXPENSE_CREATED', refId: 'x1' }),
  ])
  expect(await screen.findByRole('log', { name: 'Messaggi' })).toBeInTheDocument()
  expect(await screen.findByText('Arrivo alle 20')).toBeInTheDocument() // il log c'è subito, i messaggi arrivano dopo
  expect(screen.getByText('Tu')).toBeInTheDocument()
  expect(screen.getByText('Messaggio eliminato')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Marco ha aggiunto «Cena» · 45,00 €' })).toHaveAttribute('href', '/trips/t1/expenses/x1/edit')
})

it('il mio messaggio compare una volta anche se torna dal canale', async () => {
  mount()
  const user = userEvent.setup()
  await user.type(await screen.findByRole('textbox', { name: 'Scrivi un messaggio' }), 'Ci vediamo alle 20')
  await user.click(screen.getByRole('button', { name: 'Invia' }))
  await waitFor(() => expect(sent).toEqual([{ content: 'Ci vediamo alle 20' }]))
  act(() => push({ type: 'message.created', data: msg({ id: 'mine', authorParticipantId: 'p1', authorName: 'Vale', authorUserId: 'u1', content: 'Ci vediamo alle 20' }) }))
  expect(await screen.findAllByText('Ci vediamo alle 20')).toHaveLength(1)
  expect(screen.getByRole('textbox', { name: 'Scrivi un messaggio' })).toHaveValue('')
})

it('i messaggi e «sta scrivendo» degli altri arrivano dal canale', async () => {
  mount()
  await screen.findByRole('log', { name: 'Messaggi' })
  act(() => push({ type: 'typing', data: { participantId: 'p2', name: 'Marco' } }))
  expect(await screen.findByText('Marco sta scrivendo…')).toBeInTheDocument()
  act(() => push({ type: 'message.created', data: msg({ id: 'n1', content: 'Sono in ritardo' }) }))
  expect(await screen.findByText('Sono in ritardo')).toBeInTheDocument()
})

it('a viaggio chiuso la chat è in sola lettura', async () => {
  mount('CLOSED')
  expect(await screen.findByText('Il viaggio è chiuso: la chat è in sola lettura')).toBeInTheDocument()
  expect(screen.queryByRole('textbox', { name: 'Scrivi un messaggio' })).not.toBeInTheDocument()
})
