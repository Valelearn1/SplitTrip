import { screen } from '@testing-library/react'
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
  members: [
    { userId: 'u1', displayName: 'Marco', role: 'ORGANIZER', joinedAt: '2026-10-12T10:00:00Z' },
    { userId: 'u2', displayName: 'Giulia', role: 'MEMBER', joinedAt: '2026-10-12T11:00:00Z' },
  ],
}

describe('BalancesPage', () => {
  it('mostra i saldi e i trasferimenti suggeriti con il bottone Salda', async () => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: 't', user: { id: 'u2', email: 'g@e.it', displayName: 'Giulia' } }))
    server.use(
      http.get('http://localhost/api/trips/t1', () => HttpResponse.json(trip)),
      http.get('http://localhost/api/trips/t1/balances', () =>
        HttpResponse.json({
          balances: [
            { userId: 'u1', displayName: 'Marco', paid: 90, owed: 30, net: 15 },
            { userId: 'u2', displayName: 'Giulia', paid: 30, owed: 45, net: -15 },
          ],
          suggestedTransfers: [{ fromUserId: 'u2', fromName: 'Giulia', toUserId: 'u1', toName: 'Marco', amount: 15 }],
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
    expect(screen.getByRole('link', { name: 'Salda' })).toHaveAttribute('href', '/trips/t1/settlements/new?from=u2&to=u1&amount=15.00')
  })
})
