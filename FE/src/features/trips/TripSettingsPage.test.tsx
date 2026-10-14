import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '../../test/renderWithProviders'
import { server } from '../../test/server'
import { AUTH_STORAGE_KEY } from '../auth/authContext'
import { TripLayout } from './TripLayout'
import { TripSettingsPage } from './TripSettingsPage'

const trip = {
  id: 't1', name: 'Roma', destination: 'Roma', startDate: '2026-11-01', endDate: '2026-11-05', currency: 'EUR', status: 'ONGOING',
  inviteCode: 'ROMA-7K2P', ownerId: 'u1',
  participants: [
    { id: 'p1', userId: 'u1', displayName: 'Vale', role: 'ORGANIZER', defaultWeight: 1, arrivalDate: null, departureDate: null },
    { id: 'p2', userId: 'u2', displayName: 'Marco', role: 'MEMBER', defaultWeight: 1, arrivalDate: null, departureDate: null },
    { id: 'p3', userId: null, displayName: 'Nonna Pina', role: 'MEMBER', defaultWeight: 0.5, arrivalDate: null, departureDate: null },
  ],
}
const routes = [{ path: '/trips/:tripId', element: <TripLayout />, children: [{ path: 'settings', element: <TripSettingsPage /> }] }]

describe('TripSettingsPage', () => {
  it('un membro modifica la propria partecipazione', async () => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: 't', user: { id: 'u2', email: 'm@e.it', displayName: 'Marco' } }))
    let sent: unknown
    server.use(
      http.get('http://localhost/api/trips/t1', () => HttpResponse.json(trip)),
      http.get('http://localhost/api/trips/t1/balances', () => HttpResponse.json({ balances: [], suggestedTransfers: [] })),
      http.patch('http://localhost/api/trips/t1/participants/p2', async ({ request }) => { sent = await request.json(); return HttpResponse.json(trip.participants[1]) }),
    )
    renderWithProviders(routes, '/trips/t1/settings')
    const user = userEvent.setup()
    expect(await screen.findByRole('heading', { name: 'La mia partecipazione' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Partecipanti' })).not.toBeInTheDocument()
    await user.type(screen.getByLabelText('Arrivo'), '2026-11-03')
    await user.clear(screen.getByLabelText('Peso'))
    await user.type(screen.getByLabelText('Peso'), '2')
    await user.click(screen.getByRole('button', { name: 'Salva la mia partecipazione' }))
    await screen.findByText('Salvato')
    expect(sent).toMatchObject({ arrivalDate: '2026-11-03', defaultWeight: 2 })
  })

  it("l'organizzatore vede i senza account, aggiunge e scollega", async () => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: 't', user: { id: 'u1', email: 'v@e.it', displayName: 'Vale' } }))
    let added: unknown
    let unlinked = false
    server.use(
      http.get('http://localhost/api/trips/t1', () => HttpResponse.json(trip)),
      http.get('http://localhost/api/trips/t1/balances', () => HttpResponse.json({ balances: [], suggestedTransfers: [] })),
      http.post('http://localhost/api/trips/t1/participants', async ({ request }) => { added = await request.json(); return HttpResponse.json({}, { status: 201 }) }),
      http.post('http://localhost/api/trips/t1/participants/p2/unlink', () => { unlinked = true; return HttpResponse.json(trip.participants[1]) }),
    )
    renderWithProviders(routes, '/trips/t1/settings')
    const user = userEvent.setup()
    expect(await screen.findByText('senza account')).toBeInTheDocument()
    await user.type(screen.getByLabelText('Nome del nuovo partecipante'), 'Zio Beppe')
    await user.click(screen.getByRole('button', { name: 'Aggiungi senza account' }))
    expect(added).toEqual({ displayName: 'Zio Beppe' })
    await user.click(screen.getByRole('button', { name: 'Scollega account di Marco' }))
    await user.click(screen.getByRole('button', { name: 'Conferma' }))
    expect(unlinked).toBe(true)
  })
})
