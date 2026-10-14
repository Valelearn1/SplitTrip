import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { expect, it } from 'vitest'
import { renderWithProviders } from '../../test/renderWithProviders'
import { server } from '../../test/server'
import { AUTH_STORAGE_KEY } from '../auth/authContext'
import { ExpenseFormPage } from '../expenses/ExpenseFormPage'
import { TripLayout } from '../trips/TripLayout'
import { NotificationsPage } from './NotificationsPage'

const trip = {
  id: 't1', name: 'Roma', destination: 'Roma', startDate: '2026-11-01', endDate: '2026-11-05', currency: 'EUR', status: 'ONGOING',
  inviteCode: 'ROMA-7K2P', ownerId: 'u1',
  participants: [{ id: 'p1', userId: 'u1', displayName: 'Vale', role: 'ORGANIZER', defaultWeight: 1, arrivalDate: null, departureDate: null, hasAvatar: false }],
}

it('apre il link della notifica e la segna come letta; una spesa cancellata non rompe nulla', async () => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: 't', user: { id: 'u1', email: 'v@e.it', displayName: 'Vale', hasAvatar: false } }))
  let read = ''
  server.use(
    http.get('http://localhost/api/notifications', () => HttpResponse.json([
      { id: 'n1', tripId: 't1', type: 'EXPENSE_ADDED', message: 'Marco ha aggiunto «Cena» (tua quota 15,00 €)', link: '/trips/t1/expenses/e9/edit', readAt: null, createdAt: '2026-10-14T10:00:00Z' },
    ])),
    http.patch('http://localhost/api/notifications/:id/read', ({ params }) => { read = String(params.id); return new HttpResponse(null, { status: 204 }) }),
    http.get('http://localhost/api/trips/t1', () => HttpResponse.json(trip)),
    http.get('http://localhost/api/trips/t1/balances', () => HttpResponse.json({ balances: [], suggestedTransfers: [] })),
    http.get('http://localhost/api/trips/t1/expenses/e9', () => HttpResponse.json({ status: 404, title: 'Non trovato', detail: 'Spesa non trovata' }, { status: 404 })),
  )
  renderWithProviders([
    { path: '/notifications', element: <NotificationsPage /> },
    { path: '/trips/:tripId', element: <TripLayout />, children: [{ path: 'expenses/:expenseId/edit', element: <ExpenseFormPage /> }] },
  ], '/notifications')
  const user = userEvent.setup()
  await user.click(await screen.findByRole('link', { name: /Marco ha aggiunto/ }))
  expect(read).toBe('n1')
  expect(await screen.findByText('Spesa non trovata')).toBeInTheDocument()
})
