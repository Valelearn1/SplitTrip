import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { expect, it } from 'vitest'
import { renderWithProviders } from '../../test/renderWithProviders'
import { server } from '../../test/server'
import { AUTH_STORAGE_KEY } from '../auth/authContext'
import { TripLayout } from './TripLayout'
import { TripSettingsPage } from './TripSettingsPage'
import { expectAccessible } from '../../test/a11y'

const trip = {
  id: 't1', name: 'Lisbona 2026', destination: 'Lisbona', startDate: '2026-11-01', endDate: '2026-11-06', currency: 'EUR', status: 'PLANNING',
  inviteCode: 'LISB-7K2P', ownerId: 'u1', latitude: null, longitude: null,
  participants: [
    { id: 'p1', userId: 'u1', displayName: 'Vale', role: 'ORGANIZER', defaultWeight: 1, arrivalDate: null, departureDate: null, hasAvatar: false },
    { id: 'p2', userId: 'u2', displayName: 'Marco', role: 'MEMBER', defaultWeight: 1, arrivalDate: null, departureDate: null, hasAvatar: false },
    { id: 'p3', userId: null, displayName: 'Nonna Pina', role: 'MEMBER', defaultWeight: 0.5, arrivalDate: '2026-11-03', departureDate: null, hasAvatar: false },
  ],
}
const routes = [{ path: '/trips/:tripId', element: <TripLayout />, children: [{ path: 'settings', element: <TripSettingsPage /> }] }]
const vale = { token: 't', user: { id: 'u1', email: 'v@e.it', displayName: 'Vale', hasAvatar: false, preferredCurrency: 'EUR', chatSound: true, reduceMotion: false } }

function baseHandlers() {
  return [
    http.get('http://localhost/api/trips/t1', () => HttpResponse.json(trip)),
    http.get('http://localhost/api/trips/t1/balances', () => HttpResponse.json({ balances: [], suggestedTransfers: [] })),
    http.get('http://localhost/api/notifications/unread-count', () => HttpResponse.json({ count: 0 })),
    http.get('http://localhost/api/trips/t1/messages/unread-count', () => HttpResponse.json({ count: 0 })),
  ]
}

it('tre schede: la scheda nell’URL e i permessi di chi non organizza', async () => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: 't', user: { id: 'u2', email: 'm@e.it', displayName: 'Marco', hasAvatar: false, preferredCurrency: 'EUR', chatSound: true, reduceMotion: false } }))
  server.use(...baseHandlers())
  const router = renderWithProviders(routes, '/trips/t1/settings?tab=persone')
  expect(await screen.findByRole('tab', { name: 'Persone', selected: true })).toBeInTheDocument()
  expect(screen.getByText('LISB-7K2P')).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Aggiungi chi non usa l’app' })).not.toBeInTheDocument()   // solo organizzatore
  const user = userEvent.setup()
  await user.click(screen.getByRole('tab', { name: 'Viaggio' }))
  expect(router.state.location.search).toBe('?tab=viaggio')
  expect(screen.getByText('Lisbona')).toBeInTheDocument()                                              // sola lettura
  expect(screen.queryByRole('button', { name: 'Salva' })).not.toBeInTheDocument()
  await user.click(screen.getByRole('tab', { name: 'Io' }))
  expect(screen.getByRole('group', { name: 'Conta per' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Lascia il viaggio' })).toBeInTheDocument()
  await expectAccessible()   // D-65
})

it('l’organizzatore modifica il viaggio e non può lasciarlo', async () => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: 't', user: { id: 'u1', email: 'v@e.it', displayName: 'Vale', hasAvatar: false, preferredCurrency: 'EUR', chatSound: true, reduceMotion: false } }))
  let sent: unknown
  server.use(...baseHandlers(), http.patch('http://localhost/api/trips/t1', async ({ request }) => { sent = await request.json(); return HttpResponse.json(trip) }))
  renderWithProviders(routes, '/trips/t1/settings')
  expect(await screen.findByRole('tab', { name: 'Viaggio', selected: true })).toBeInTheDocument()    // organizzatore: parte da Viaggio
  const user = userEvent.setup()
  await user.clear(screen.getByLabelText('Nome')); await user.type(screen.getByLabelText('Nome'), 'Lisbona a novembre')
  await user.click(screen.getByRole('button', { name: 'Salva' }))
  await waitFor(() => expect(sent).toMatchObject({ name: 'Lisbona a novembre' }))
  expect(screen.getByRole('button', { name: 'Elimina viaggio' })).toBeInTheDocument()
  await user.click(screen.getByRole('tab', { name: 'Io' }))
  expect(screen.queryByRole('button', { name: 'Lascia il viaggio' })).not.toBeInTheDocument()
  expect(screen.getByText('L’organizzatore non può lasciare il viaggio.')).toBeInTheDocument()
})


it('Persone: l’organizzatore vede chi conta per quanto, aggiunge chi non usa l’app e scollega', async () => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(vale))
  let added: unknown
  let unlinked = false
  server.use(
    ...baseHandlers(),
    http.post('http://localhost/api/trips/t1/participants', async ({ request }) => { added = await request.json(); return HttpResponse.json({}, { status: 201 }) }),
    http.post('http://localhost/api/trips/t1/participants/p2/unlink', () => { unlinked = true; return HttpResponse.json(trip.participants[1]) }),
  )
  renderWithProviders(routes, '/trips/t1/settings?tab=persone')
  expect(await screen.findByText('senza account')).toBeInTheDocument()
  expect(screen.getByText(/conta per ½/)).toBeInTheDocument()
  expect(screen.getByText(/arriva il 3 nov/)).toBeInTheDocument()
  const user = userEvent.setup()
  await user.type(screen.getByLabelText('Nome del nuovo partecipante'), 'Zio Beppe')
  await user.click(screen.getByRole('button', { name: 'Aggiungi chi non usa l’app' }))
  await waitFor(() => expect(added).toEqual({ displayName: 'Zio Beppe' }))
  await user.click(screen.getByRole('button', { name: 'Scollega account di Marco' }))
  await user.click(screen.getByRole('button', { name: 'Conferma' }))
  await waitFor(() => expect(unlinked).toBe(true))
})

it('cambiare la destinazione richiede una proposta dall\'elenco', async () => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: 't', user: { id: 'u1', email: 'v@e.it', displayName: 'Vale', hasAvatar: false, preferredCurrency: 'EUR', chatSound: true, reduceMotion: false } }))
  let patched = false
  server.use(...baseHandlers(), http.patch('http://localhost/api/trips/t1', () => { patched = true; return HttpResponse.json(trip) }),
    http.get('http://localhost/api/places', () => HttpResponse.json([])))
  renderWithProviders(routes, '/trips/t1/settings')
  const user = userEvent.setup()
  const destination = await screen.findByLabelText('Destinazione')
  await user.clear(destination); await user.type(destination, 'Braga')
  await user.click(screen.getByRole('button', { name: 'Salva' }))
  expect(await screen.findByText('Scegli la destinazione dall\'elenco')).toBeInTheDocument()
  expect(patched).toBe(false)
})
