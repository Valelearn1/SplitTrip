import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '../../test/renderWithProviders'
import { server } from '../../test/server'
import { AUTH_STORAGE_KEY } from '../auth/authContext'
import { TripLayout } from '../trips/TripLayout'
import { ExpenseFormPage } from './ExpenseFormPage'

const trip = {
  id: 't1', name: 'Roma', destination: 'Roma', startDate: '2026-11-01', endDate: '2026-11-05', currency: 'EUR', status: 'ONGOING',
  inviteCode: 'ROMA-7K2P', ownerId: 'u1',
  participants: [
    { id: 'p1', userId: 'u1', displayName: 'Vale', role: 'ORGANIZER', defaultWeight: 1, arrivalDate: null, departureDate: null },
    { id: 'p2', userId: 'u2', displayName: 'Marco', role: 'MEMBER', defaultWeight: 1, arrivalDate: null, departureDate: null },
  ],
}

describe('ExpenseFormPage', () => {
  it('crea una spesa equa con me come pagante e tutti inclusi', async () => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: 't', user: { id: 'u2', email: 'm@e.it', displayName: 'Marco' } }))
    let sent: unknown
    server.use(
      http.get('http://localhost/api/trips/t1', () => HttpResponse.json(trip)),
      http.post('http://localhost/api/trips/t1/expenses', async ({ request }) => {
        sent = await request.json()
        return HttpResponse.json({ id: 'e1' }, { status: 201 })
      }),
    )
    const router = renderWithProviders(
      [{ path: '/trips/:tripId', element: <TripLayout />, children: [
        { path: 'expenses/new', element: <ExpenseFormPage /> },
        { path: 'expenses', element: <h2>Lista spese</h2> },
      ] }],
      '/trips/t1/expenses/new',
    )
    const user = userEvent.setup()
    await user.type(await screen.findByLabelText('Importo'), '90')
    await user.type(screen.getByLabelText('Descrizione'), 'Cena')
    await user.click(screen.getByRole('button', { name: 'Salva' }))

    expect(await screen.findByRole('heading', { name: 'Lista spese' })).toBeInTheDocument()
    expect(sent).toMatchObject({ description: 'Cena', amount: 90, payerId: 'p2', splitType: 'EQUAL', category: 'FOOD',
      shares: [{ participantId: 'p1' }, { participantId: 'p2' }] })
    expect(router.state.location.pathname).toBe('/trips/t1/expenses')
  })
})
