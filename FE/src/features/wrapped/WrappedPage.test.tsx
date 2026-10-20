import { act, screen, waitFor } from '@testing-library/react'
import { focusManager } from '@tanstack/react-query'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { beforeEach, expect, it, vi } from 'vitest'
import { renderWithProviders } from '../../test/renderWithProviders'
import { server } from '../../test/server'
import { AUTH_STORAGE_KEY } from '../auth/authContext'
import { TripLayout } from '../trips/TripLayout'
import { WrappedPage } from './WrappedPage'
import { expectAccessible } from '../../test/a11y'

vi.mock('../photos/PointsMap', () => ({ PointsMap: ({ points }: { points: unknown[] }) => <p>mappa con {points.length} punti</p> }))
vi.mock('../../shared/ui/AuthImage', () => ({ AuthImage: ({ alt }: { alt: string }) => <img alt={alt} /> }))

const trip = { id: 't1', name: 'Lisbona 2026', destination: 'Lisbona', startDate: '2026-10-01', endDate: '2026-10-06', currency: 'EUR', status: 'CLOSED', inviteCode: 'X', ownerId: 'u1', latitude: null, longitude: null,
  participants: [{ id: 'p1', userId: 'u1', displayName: 'Vale', role: 'ORGANIZER', defaultWeight: 1, arrivalDate: null, departureDate: null, hasAvatar: false }, { id: 'p2', userId: 'u2', displayName: 'Marco', role: 'MEMBER', defaultWeight: 1, arrivalDate: null, departureDate: null, hasAvatar: false }] }
const people = [
  { participantId: 'p1', displayName: 'Vale', hasAccount: true, userId: 'u1', joinedAt: '2026-09-01T00:00:00Z', paid: 620, photos: 14, messages: 3, reactionsReceived: 9, foodPaid: 0, places: 3 },
  { participantId: 'p2', displayName: 'Marco', hasAccount: true, userId: 'u2', joinedAt: '2026-09-02T00:00:00Z', paid: 96, photos: 2, messages: 31, reactionsReceived: 2, foodPaid: 96, places: 0 },
]
const wrapped = (guess: object) => ({
  trip: { id: 't1', name: 'Lisbona 2026', destination: 'Lisbona', startDate: '2026-10-01', endDate: '2026-10-06', nights: 5, people: 2, currency: 'EUR', coverPhotoId: 'ph1' },
  totals: { groupTotal: 716, perPerson: 358, expenseCount: 4, photos: 16, messages: 34, reactions: 11 },
  byCategory: [{ category: 'LODGING', amount: 600, share: 84 }, { category: 'FOOD', amount: 116, share: 16 }],
  biggestExpense: { description: 'Casa ad Alfama', amount: 600, payerName: 'Vale' }, priciestDay: { date: '2026-10-01', amount: 600 },
  moments: [{ photoId: 'ph1', caption: 'Alfama', placeName: 'Alfama', latitude: 38.71, longitude: -9.13 }],
  people,
  badges: [{ participantId: 'p1', code: 'BANKER', title: '💰 Il banchiere', detail: 'ha anticipato 620,00' }, { participantId: 'p2', code: 'VOICE', title: '💬 La voce del gruppo', detail: '31 messaggi' }],
  settlement: { settled: false, openTransfers: 1 }, guess,
})
const routes = [{ path: '/trips/:tripId', element: <TripLayout />, children: [{ path: 'riepilogo', element: <WrappedPage /> }, { path: 'balances', element: <p>Saldi</p> }] }]
beforeEach(() => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: 't', user: { id: 'u1', email: 'v@e.it', displayName: 'Vale', hasAvatar: false, preferredCurrency: 'EUR', chatSound: true, reduceMotion: true, theme: 'SYSTEM' } }))
  server.use(
    http.get('http://localhost/api/trips/t1', () => HttpResponse.json(trip)),
    http.get('http://localhost/api/trips/t1/balances', () => HttpResponse.json({ balances: [], suggestedTransfers: [] })),
    http.get('http://localhost/api/notifications/unread-count', () => HttpResponse.json({ count: 0 })),
    http.get('http://localhost/api/trips/t1/messages/unread-count', () => HttpResponse.json({ count: 0 })),
  )
})

it('prima scommetti, poi la rivelazione, poi i numeri, i badge e le classifiche', async () => {
  let sent: unknown
  let played = false
  server.use(
    http.get('http://localhost/api/trips/t1/wrapped', () => HttpResponse.json(wrapped(played
      ? { mine: 700, played: 2, others: [{ participantId: 'p2', displayName: 'Marco', amount: 710, diff: 6 }, { participantId: 'p1', displayName: 'Vale', amount: 700, diff: 16 }] }
      : { mine: null, played: 1, others: null }))),
    http.post('http://localhost/api/trips/t1/wrapped/guess', async ({ request }) => { sent = await request.json(); played = true; return new HttpResponse(null, { status: 204 }) }),
  )
  renderWithProviders(routes, '/trips/t1/riepilogo')
  const user = userEvent.setup()
  await user.type(await screen.findByLabelText('Quanto pensate di aver speso in tutto?'), '700')
  await user.click(screen.getByRole('button', { name: 'Scommetto!' }))
  await waitFor(() => expect(sent).toEqual({ amount: 700 }))
  expect(await screen.findByText(/scarto di 16,00\s€/)).toBeInTheDocument()                 // frasi neutre: niente «sbagliato/a»
  expect(screen.getByText(/Ha indovinato meglio: Marco/)).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Guarda i numeri' }))
  expect(await screen.findByText(/716,00\s€/)).toBeInTheDocument()
  expect(screen.getByText('Dove sono finiti i soldi')).toBeInTheDocument()
  expect(screen.getByText('Alloggio')).toBeInTheDocument()                                // CATEGORY_LABELS
  expect(screen.getByText('Casa ad Alfama')).toBeInTheDocument()
  expect(screen.getByText('mappa con 1 punti')).toBeInTheDocument()
  expect(screen.getByText('Il banchiere')).toBeInTheDocument()                          // l'emoji sta accanto al nome
  expect(screen.getByRole('heading', { name: 'Chi ha fatto più foto' })).toBeInTheDocument()
  expect(screen.getAllByText('Vale')[0]).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /Mancano 1 rimborsi|Manca 1 rimborso/ })).toHaveAttribute('href', '/trips/t1/balances')
  await expectAccessible()   // D-65
})

it('«Salta» mostra solo il totale e «2 hanno giocato»; con tutto a zero le classifiche non ci sono', async () => {
  const empty = { ...wrapped({ mine: null, played: 2, others: null }), totals: { groupTotal: 716, perPerson: 358, expenseCount: 4, photos: 0, messages: 0, reactions: 0 }, people: people.map((p) => ({ ...p, photos: 0, messages: 0, reactionsReceived: 0 })), badges: [{ participantId: 'p1', code: 'COMPANION', title: '🧳 Compagno di viaggio', detail: 'c\'era, e tanto basta' }, { participantId: 'p2', code: 'COMPANION', title: '🧳 Compagno di viaggio', detail: 'c\'era, e tanto basta' }], settlement: { settled: true, openTransfers: 0 } }
  server.use(http.get('http://localhost/api/trips/t1/wrapped', () => HttpResponse.json(empty)))
  renderWithProviders(routes, '/trips/t1/riepilogo')
  await userEvent.setup().click(await screen.findByRole('button', { name: 'Salta e guarda i numeri' }))
  expect(await screen.findByText('2 hanno giocato')).toBeInTheDocument()
  expect(screen.queryByText(/scarto di/)).not.toBeInTheDocument()
  await userEvent.setup().click(screen.getByRole('button', { name: 'Guarda i numeri' }))
  expect(await screen.findByText('Conti chiusi: siete in pari')).toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'Chi ha fatto più foto' })).not.toBeInTheDocument()   // Review Focus 1
  expect(screen.getAllByText(/Compagno di viaggio/)).toHaveLength(2)
  expect(screen.queryByRole('heading', { name: 'Il gruppo' })).not.toBeInTheDocument()   // tre zeri non raccontano niente
})

it('prima della fine la pagina lo dice', async () => {
  server.use(http.get('http://localhost/api/trips/t1/wrapped', () => HttpResponse.json({ status: 409, title: 'Conflitto', detail: 'Il riepilogo arriva a fine viaggio' }, { status: 409 })))
  renderWithProviders(routes, '/trips/t1/riepilogo')
  expect(await screen.findByText('Il riepilogo arriva a fine viaggio')).toBeInTheDocument()
})

it('se la scommessa non parte lo dice, e se c\'era già (da un altro dispositivo) va alla rivelazione', async () => {
  let played = false
  let fail = true
  server.use(
    http.get('http://localhost/api/trips/t1/wrapped', () => HttpResponse.json(wrapped(played
      ? { mine: 700, played: 1, others: [{ participantId: 'p1', displayName: 'Vale', amount: 700, diff: 16 }] }
      : { mine: null, played: 0, others: null }))),
    http.post('http://localhost/api/trips/t1/wrapped/guess', () => {
      if (fail) return HttpResponse.json({ status: 500, title: 'Errore', detail: 'Qualcosa è andato storto' }, { status: 500 })
      played = true
      return HttpResponse.json({ status: 409, title: 'Conflitto', detail: 'Hai già fatto la tua ipotesi' }, { status: 409 })
    }),
  )
  renderWithProviders(routes, '/trips/t1/riepilogo')
  const user = userEvent.setup()
  await user.type(await screen.findByLabelText('Quanto pensate di aver speso in tutto?'), '700')
  await user.click(screen.getByRole('button', { name: 'Scommetto!' }))
  expect(await screen.findByRole('alert')).toHaveTextContent('Qualcosa è andato storto')
  expect(screen.getByLabelText('Quanto pensate di aver speso in tutto?')).toHaveValue('700')   // il campo resta com'era

  fail = false
  await user.click(screen.getByRole('button', { name: 'Scommetto!' }))
  expect(await screen.findByText(/scarto di 16,00\s€/)).toBeInTheDocument()
})

it('se il server non si raggiunge più, il riepilogo già caricato resta invece di «Torna qui dopo» (D-63)', async () => {
  server.use(http.get('http://localhost/api/trips/t1/wrapped', () => HttpResponse.json(wrapped({ mine: 300, played: 1, others: [] }))))
  renderWithProviders(routes, '/trips/t1/riepilogo')
  expect(await screen.findByText('Avete speso in tutto')).toBeInTheDocument()
  server.use(http.get('http://localhost/api/trips/t1/wrapped', () => HttpResponse.error()))
  act(() => { focusManager.setFocused(false); focusManager.setFocused(true) })
  await new Promise((r) => setTimeout(r, 300))
  expect(screen.getByText('Avete speso in tutto')).toBeInTheDocument()
  expect(screen.queryByText(/Torna qui dopo il/)).not.toBeInTheDocument()
  act(() => focusManager.setFocused(undefined))
})
