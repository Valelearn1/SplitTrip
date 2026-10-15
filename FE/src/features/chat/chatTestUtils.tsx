import { http, HttpResponse } from 'msw'
import type { ChatMessage } from '../../shared/api/types'
import { LiveContext } from '../../shared/live/liveContext'
import { renderWithProviders } from '../../test/renderWithProviders'
import { server } from '../../test/server'
import { AUTH_STORAGE_KEY } from '../auth/authContext'
import { TripLayout } from '../trips/TripLayout'
import { ChatPage } from './ChatPage'

/** Helper condivisi dai test della chat (ChatPage, reazioni). */
export const trip = (status = 'ONGOING') => ({
  id: 't1', name: 'Roma', destination: 'Roma', startDate: '2026-11-01', endDate: '2026-11-05', currency: 'EUR', status,
  inviteCode: 'ROMA-7K2P', ownerId: 'u1',
  participants: [
    { id: 'p1', userId: 'u1', displayName: 'Vale', role: 'ORGANIZER', defaultWeight: 1, arrivalDate: null, departureDate: null, hasAvatar: false },
    { id: 'p2', userId: 'u2', displayName: 'Marco', role: 'MEMBER', defaultWeight: 1, arrivalDate: null, departureDate: null, hasAvatar: false },
  ],
})
export const msg = (over: Partial<ChatMessage>): ChatMessage => ({
  id: 'x', kind: 'TEXT', authorParticipantId: 'p2', authorName: 'Marco', authorUserId: 'u2', authorHasAvatar: false,
  content: 'Ciao', eventType: null, refId: null, createdAt: new Date().toISOString(), deleted: false, reactions: [], ...over,
})

// TripLayout (sincronizza la cache) e ChatPage («sta scrivendo») si iscrivono entrambi: il canale finto consegna a tutti
export const listeners = new Set<(b: unknown) => void>()
export const push = (b: unknown) => listeners.forEach((l) => l(b))
export const live = { status: 'connected' as const, publish: () => {}, subscribe: (_d: string, cb: (b: unknown) => void) => { listeners.add(cb); return () => { listeners.delete(cb) } } }
export const sent: unknown[] = []

export function mount(status = 'ONGOING', items: ChatMessage[] = [], older?: { items: ChatMessage[]; onLoad: () => void }) {
  server.use(
    http.get('http://localhost/api/trips/t1', () => HttpResponse.json(trip(status))),
    http.get('http://localhost/api/trips/t1/balances', () => HttpResponse.json({ balances: [], suggestedTransfers: [] })),
    http.get('http://localhost/api/notifications/unread-count', () => HttpResponse.json({ count: 0 })),
    http.get('http://localhost/api/trips/t1/messages/unread-count', () => HttpResponse.json({ count: 0 })),
    http.post('http://localhost/api/trips/t1/messages/read', () => new HttpResponse(null, { status: 204 })),
    http.get('http://localhost/api/trips/t1/messages', ({ request }) => {
      if (older && new URL(request.url).searchParams.get('before')) { older.onLoad(); return HttpResponse.json({ items: older.items, hasMore: false }) }
      return HttpResponse.json({ items, hasMore: !!older })
    }),
    http.post('http://localhost/api/trips/t1/messages', async ({ request }) => {
      const body = (await request.json()) as { content: string }
      sent.push(body)
      return HttpResponse.json(msg({ id: 'mine', authorParticipantId: 'p1', authorName: 'Vale', authorUserId: 'u1', content: body.content }), { status: 201 })
    }),
  )
  renderWithProviders([{ path: '/trips/:tripId', element: <LiveContext value={live}><TripLayout /></LiveContext>, children: [
    { index: true, element: <p>Panoramica del viaggio</p> }, { path: 'chat', element: <ChatPage /> }] }], '/trips/t1/chat')
}

/** Vale (u1, partecipante p1) ha fatto il login; i messaggi inviati ripartono da zero. */
export function loginAsVale() {
  sent.length = 0
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: 't', user: { id: 'u1', email: 'v@e.it', displayName: 'Vale', hasAvatar: false } }))
}
