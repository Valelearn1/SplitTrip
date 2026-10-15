import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '../../test/renderWithProviders'
import { server } from '../../test/server'
import { AUTH_STORAGE_KEY } from '../auth/authContext'
import { TripLayout } from '../trips/TripLayout'
import { BalancesPage } from './BalancesPage'

const trip = {
  id: 't1', name: 'Roma', destination: 'Roma', startDate: '2026-11-01', endDate: '2026-11-05', currency: 'EUR', status: 'ONGOING',
  inviteCode: 'ROMA-7K2P', ownerId: 'u1',
  participants: [
    { id: 'p1', userId: 'u1', displayName: 'Marco', role: 'ORGANIZER', defaultWeight: 1, arrivalDate: null, departureDate: null },
    { id: 'p2', userId: 'u2', displayName: 'Giulia', role: 'MEMBER', defaultWeight: 1, arrivalDate: null, departureDate: null },
  ],
}

describe('BalancesPage', () => {
  it('mostra i saldi e i trasferimenti suggeriti con il bottone Salda', async () => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: 't', user: { id: 'u2', email: 'g@e.it', displayName: 'Giulia' } }))
    server.use(
      http.get('http://localhost/api/trips/t1', () => HttpResponse.json(trip)),
      http.get('http://localhost/api/trips/t1/messages/unread-count', () => HttpResponse.json({ count: 0 })),
      http.get('http://localhost/api/trips/t1/balances', () =>
        HttpResponse.json({
          balances: [
            { participantId: 'p1', displayName: 'Marco', left: false, paid: 90, owed: 30, net: 15 },
            { participantId: 'p2', displayName: 'Giulia', left: false, paid: 30, owed: 45, net: -15 },
          ],
          suggestedTransfers: [{ fromParticipantId: 'p2', fromName: 'Giulia', toParticipantId: 'p1', toName: 'Marco', amount: 15 }],
        }),
      ),
      http.get('http://localhost/api/trips/t1/settlements', () => HttpResponse.json([])),
    )
    renderWithProviders(
      [{ path: '/trips/:tripId', element: <TripLayout />, children: [{ path: 'balances', element: <BalancesPage /> }] }],
      '/trips/t1/balances',
    )
    expect(await screen.findByText('Giulia → Marco')).toBeInTheDocument()
    expect(screen.getAllByText(/15,00\s€/).length).toBeGreaterThan(0)
    expect(screen.getByRole('link', { name: 'Salda' })).toHaveAttribute('href', '/trips/t1/settlements/new?from=p2&to=p1&amount=15.00')
  })

  it('un rimborso si espande e la nota si legge per intero', async () => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: 't', user: { id: 'u2', email: 'g@e.it', displayName: 'Giulia' } }))
    const note = 'Cena di ieri sera più i biglietti del tram 28 e il caffè a Belém'
    server.use(
      http.get('http://localhost/api/trips/t1', () => HttpResponse.json(trip)),
      http.get('http://localhost/api/trips/t1/messages/unread-count', () => HttpResponse.json({ count: 0 })),
      http.get('http://localhost/api/trips/t1/balances', () => HttpResponse.json({ balances: [], suggestedTransfers: [] })),
      http.get('http://localhost/api/trips/t1/settlements', () => HttpResponse.json([
        { id: 's1', fromParticipantId: 'p2', fromName: 'Giulia', toParticipantId: 'p1', toName: 'Marco', amount: 15, date: '2026-11-04', note, createdBy: 'u2', createdAt: '2026-11-04T10:00:00Z' },
      ])),
    )
    renderWithProviders(
      [{ path: '/trips/:tripId', element: <TripLayout />, children: [{ path: 'balances', element: <BalancesPage /> }] }],
      '/trips/t1/balances',
    )
    const toggle = await screen.findByRole('button', { name: 'Dettagli del rimborso Giulia → Marco' })
    expect(screen.queryByText(`Nota: ${note}`)).not.toBeInTheDocument()
    await userEvent.setup().click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText(`Nota: ${note}`)).toBeInTheDocument()
  })
})
