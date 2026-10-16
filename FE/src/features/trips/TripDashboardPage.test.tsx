import { cleanup, screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '../../test/renderWithProviders'
import { server } from '../../test/server'
import { AUTH_STORAGE_KEY } from '../auth/authContext'
import { TripDashboardPage } from './TripDashboardPage'
import { TripLayout } from './TripLayout'

const trip = {
  id: 't1', name: 'Roma 2026', destination: 'Roma', startDate: '2026-11-01', endDate: '2026-11-05', currency: 'EUR',
  status: 'ONGOING', inviteCode: 'ROMA-7K2P', ownerId: 'u1',
  participants: [
    { id: 'p1', userId: 'u1', displayName: 'Vale', role: 'ORGANIZER', defaultWeight: 1, arrivalDate: null, departureDate: null },
    { id: 'p2', userId: 'u2', displayName: 'Marco', role: 'MEMBER', defaultWeight: 1, arrivalDate: null, departureDate: null },
  ],
}

describe('TripDashboardPage', () => {
  it('mostra il mio saldo, il totale, il codice invito e i membri', async () => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: 't', user: { id: 'u2', email: 'm@e.it', displayName: 'Marco' } }))
    server.use(
      http.get('http://localhost/api/trips/t1', () => HttpResponse.json(trip)),
      http.get('http://localhost/api/trips/t1/summary', () => HttpResponse.json({ total: 120, byCategory: { FOOD: 90, TRANSPORT: 30 }, byPayer: [] })),
      http.get('http://localhost/api/trips/t1/messages/unread-count', () => HttpResponse.json({ count: 0 })),
      http.get('http://localhost/api/trips/t1/ai/tips', () => HttpResponse.json({ available: false, remainingToday: 5, tips: [], generatedAt: null })),
      http.get('http://localhost/api/trips/t1/balances', () =>
        HttpResponse.json({
          balances: [
            { participantId: 'p1', displayName: 'Vale', left: false, paid: 90, owed: 45, net: 45 },
            { participantId: 'p2', displayName: 'Marco', left: false, paid: 30, owed: 75, net: -45 },
          ],
          suggestedTransfers: [{ fromParticipantId: 'p2', fromName: 'Marco', toParticipantId: 'p1', toName: 'Vale', amount: 45 }],
        }),
      ),
      http.get('http://localhost/api/trips/t1/expenses', () => HttpResponse.json([])),
      http.get('http://localhost/api/trips/t1/weather', () => HttpResponse.json({ days: [] })),
    )
    renderWithProviders(
      [{ path: '/trips/:tripId', element: <TripLayout />, children: [{ index: true, element: <TripDashboardPage /> }] }],
      '/trips/t1',
    )
    expect(await screen.findByRole('heading', { name: 'Roma 2026' })).toBeInTheDocument()
    expect(await screen.findByText('Devi dare')).toBeInTheDocument()
    expect(screen.getByText(/45,00\s€/)).toBeInTheDocument()
    expect(screen.getByText(/120,00\s€/)).toBeInTheDocument()
    expect(screen.getByText('ROMA-7K2P')).toBeInTheDocument()
    expect(screen.getByText('Vale')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Impostazioni del viaggio' })).toBeInTheDocument() // anche i membri: «La mia partecipazione»
    expect(screen.getByRole('link', { name: 'Liste' })).toHaveAttribute('href', '/trips/t1/lists')
    expect(screen.getByRole('link', { name: 'Foto' })).toHaveAttribute('href', '/trips/t1/photos')
  })

  it('card Giochi: a viaggio aperto la ruota, a viaggio chiuso il link al riepilogo', async () => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: 't', user: { id: 'u2', email: 'm@e.it', displayName: 'Marco' } }))
    const base = [
      http.get('http://localhost/api/trips/t1/summary', () => HttpResponse.json({ total: 0, byCategory: {}, byPayer: [] })),
      http.get('http://localhost/api/trips/t1/messages/unread-count', () => HttpResponse.json({ count: 0 })),
      http.get('http://localhost/api/trips/t1/ai/tips', () => HttpResponse.json({ available: false, remainingToday: 5, tips: [], generatedAt: null })),
      http.get('http://localhost/api/trips/t1/balances', () => HttpResponse.json({ balances: [], suggestedTransfers: [] })),
      http.get('http://localhost/api/trips/t1/expenses', () => HttpResponse.json([])),
      http.get('http://localhost/api/trips/t1/weather', () => HttpResponse.json({ days: [] })),
    ]
    const routes = [{ path: '/trips/:tripId', element: <TripLayout />, children: [{ index: true, element: <TripDashboardPage /> }] }]
    server.use(...base, http.get('http://localhost/api/trips/t1', () => HttpResponse.json({ ...trip, endDate: '2999-12-31' })))
    renderWithProviders(routes, '/trips/t1')
    expect(await screen.findByRole('button', { name: /Chi offre\?/ })).toBeInTheDocument()
    expect(screen.getByText('arriva a fine viaggio')).toBeInTheDocument()
    cleanup()

    server.use(http.get('http://localhost/api/trips/t1', () => HttpResponse.json({ ...trip, status: 'CLOSED' })))
    renderWithProviders(routes, '/trips/t1')
    expect(await screen.findByRole('link', { name: 'Il vostro viaggio in numeri' })).toHaveAttribute('href', '/trips/t1/riepilogo')
    expect(screen.queryByRole('button', { name: /Chi offre\?/ })).not.toBeInTheDocument()   // chiuso: niente spese nuove
  })
})
