import { act, screen } from '@testing-library/react'
import { onlineManager } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { expect, it } from 'vitest'
import { renderWithProviders } from '../../test/renderWithProviders'
import { server } from '../../test/server'
import { AUTH_STORAGE_KEY } from '../auth/authContext'
import { TripLayout } from '../trips/TripLayout'
import { ExpensesPage } from './ExpensesPage'
import { expectAccessible } from '../../test/a11y'

const trip = {
  id: 't1', name: 'Roma', destination: 'Roma', startDate: '2026-11-01', endDate: '2026-11-05', currency: 'EUR', status: 'ONGOING',
  inviteCode: 'ROMA-7K2P', ownerId: 'u1',
  participants: [{ id: 'p1', userId: 'u1', displayName: 'Vale', role: 'ORGANIZER', defaultWeight: 1, arrivalDate: null, departureDate: null }],
}

it('offline «Nuova spesa» non apre il modulo e dice che serve la rete', async () => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: 't', user: { id: 'u1', email: 'v@e.it', displayName: 'Vale' } }))
  server.use(
    http.get('http://localhost/api/trips/t1', () => HttpResponse.json(trip)),
    http.get('http://localhost/api/trips/t1/expenses', () => HttpResponse.json([])),
  )
  renderWithProviders(
    [{ path: '/trips/:tripId', element: <TripLayout />, children: [{ path: 'expenses', element: <ExpensesPage /> }] }],
    '/trips/t1/expenses',
  )
  expect(await screen.findByRole('link', { name: 'Nuova spesa' })).toBeInTheDocument()
  act(() => onlineManager.setOnline(false))
  expect(screen.getByRole('link', { name: 'Nuova spesa (serve la rete)' })).toHaveAttribute('aria-disabled', 'true')
  expect(screen.getByRole('button', { name: /Chi offre/ })).toBeDisabled()
  await expectAccessible()   // D-65
})
