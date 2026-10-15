import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { expect, it } from 'vitest'
import { renderWithProviders } from '../../test/renderWithProviders'
import { server } from '../../test/server'
import { AUTH_STORAGE_KEY } from '../auth/authContext'
import { TripLayout } from './TripLayout'
import { WelcomePage } from './WelcomePage'

const trip = {
  id: 't1', name: 'Lisbona 2026', destination: 'Lisbona', startDate: '2026-11-01', endDate: '2026-11-06', currency: 'EUR', status: 'PLANNING',
  inviteCode: 'LISB-7K2P', ownerId: 'u1', latitude: null, longitude: null,
  participants: [
    { id: 'p1', userId: 'u1', displayName: 'Vale', role: 'ORGANIZER', defaultWeight: 1, arrivalDate: null, departureDate: null, hasAvatar: false },
    { id: 'p2', userId: 'u2', displayName: 'Marco', role: 'MEMBER', defaultWeight: 1, arrivalDate: null, departureDate: null, hasAvatar: false },
  ],
}
const routes = [{ path: '/trips/:tripId', element: <TripLayout />, children: [{ index: true, element: <p>Pagina panoramica</p> }, { path: 'benvenuto', element: <WelcomePage /> }] }]
function handlers(onPatch: (b: unknown) => void) {
  return [
    http.get('http://localhost/api/trips/t1', () => HttpResponse.json(trip)),
    http.get('http://localhost/api/trips/t1/balances', () => HttpResponse.json({ balances: [], suggestedTransfers: [] })),
    http.get('http://localhost/api/notifications/unread-count', () => HttpResponse.json({ count: 0 })),
    http.get('http://localhost/api/trips/t1/messages/unread-count', () => HttpResponse.json({ count: 0 })),
    http.patch('http://localhost/api/trips/t1/participants/p2', async ({ request }) => { onPatch(await request.json()); return HttpResponse.json(trip.participants[1]) }),
  ]
}

it('«Va bene così» salva conta per e date e va alla panoramica', async () => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: 't', user: { id: 'u2', email: 'm@e.it', displayName: 'Marco', hasAvatar: false, preferredCurrency: 'EUR', chatSound: true, reduceMotion: false } }))
  let sent: unknown
  server.use(...handlers((b) => { sent = b }))
  renderWithProviders(routes, '/trips/t1/benvenuto')
  expect(await screen.findByRole('heading', { name: 'Ti diamo il benvenuto in Lisbona 2026' })).toBeInTheDocument()
  expect(screen.getByLabelText('Arrivo')).toHaveValue('2026-11-01')   // precompilate con le date del viaggio
  const user = userEvent.setup()
  await user.click(screen.getByRole('radio', { name: '2' }))
  await user.clear(screen.getByLabelText('Arrivo')); await user.type(screen.getByLabelText('Arrivo'), '2026-11-03')
  await user.click(screen.getByRole('button', { name: 'Va bene così' }))
  await waitFor(() => expect(sent).toEqual({ defaultWeight: 2, arrivalDate: '2026-11-03', departureDate: '2026-11-06' }))
  expect(await screen.findByText('Pagina panoramica')).toBeInTheDocument()
})

it('«Salta» non salva niente; le date uguali al viaggio non si inviano', async () => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: 't', user: { id: 'u2', email: 'm@e.it', displayName: 'Marco', hasAvatar: false, preferredCurrency: 'EUR', chatSound: true, reduceMotion: false } }))
  const calls: unknown[] = []
  server.use(...handlers((b) => calls.push(b)))
  renderWithProviders(routes, '/trips/t1/benvenuto')
  await screen.findByRole('heading', { name: /benvenuto/ })
  await userEvent.setup().click(screen.getByRole('button', { name: 'Salta' }))
  expect(await screen.findByText('Pagina panoramica')).toBeInTheDocument()
  expect(calls).toEqual([])
})

it('chi non è membro non vede il benvenuto (Review Focus 5)', async () => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: 't', user: { id: 'u9', email: 'x@e.it', displayName: 'Estraneo', hasAvatar: false, preferredCurrency: 'EUR', chatSound: true, reduceMotion: false } }))
  server.use(...handlers(() => { throw new Error('non deve salvare') }))
  renderWithProviders(routes, '/trips/t1/benvenuto')
  expect(await screen.findByText('Non fai parte di questo viaggio.')).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Va bene così' })).not.toBeInTheDocument()
})

it('chi aveva già date diverse può tornare a «tutto il viaggio»: le date si azzerano davvero (revisione v3.1)', async () => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: 't', user: { id: 'u2', email: 'm@e.it', displayName: 'Marco', hasAvatar: false, preferredCurrency: 'EUR', chatSound: true, reduceMotion: false } }))
  const withDates = { ...trip, participants: [trip.participants[0], { ...trip.participants[1], arrivalDate: '2026-11-03' }] }
  let sent: unknown
  server.use(http.get('http://localhost/api/trips/t1', () => HttpResponse.json(withDates)), ...handlers((b) => { sent = b }))
  renderWithProviders(routes, '/trips/t1/benvenuto')
  expect(await screen.findByLabelText('Arrivo')).toHaveValue('2026-11-03')       // l'organizzatore l'aveva messo così
  const user = userEvent.setup()
  await user.clear(screen.getByLabelText('Arrivo')); await user.type(screen.getByLabelText('Arrivo'), '2026-11-01')
  await user.click(screen.getByRole('button', { name: 'Va bene così' }))
  await waitFor(() => expect(sent).toEqual({ defaultWeight: 1, clearDates: true }))
})
