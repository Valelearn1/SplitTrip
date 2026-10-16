import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { expect, it } from 'vitest'
import { renderWithProviders } from '../../test/renderWithProviders'
import { server } from '../../test/server'
import { AUTH_STORAGE_KEY } from '../auth/authContext'
import { TripLayout } from '../trips/TripLayout'
import { SettlementFormPage } from './SettlementFormPage'

const trip = {
  id: 't1', name: 'Roma', destination: 'Roma', startDate: '2026-11-01', endDate: '2026-11-05', currency: 'EUR', status: 'ONGOING', inviteCode: 'X', ownerId: 'u1',
  participants: [
    { id: 'p1', userId: 'u1', displayName: 'Vale', role: 'ORGANIZER', defaultWeight: 1, arrivalDate: null, departureDate: null, hasAvatar: false },
    { id: 'p2', userId: 'u2', displayName: 'Marco', role: 'MEMBER', defaultWeight: 1, arrivalDate: null, departureDate: null, hasAvatar: false },
  ],
}

it('dopo «Conferma» si torna ai saldi sostituendo il modulo: «Indietro» non lo riapre', async () => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: 't', user: { id: 'u1', email: 'v@e.it', displayName: 'Vale' } }))
  let sent: unknown
  server.use(
    http.get('http://localhost/api/trips/t1', () => HttpResponse.json(trip)),
    http.get('http://localhost/api/trips/t1/balances', () => HttpResponse.json({ balances: [], suggestedTransfers: [] })),
    http.get('http://localhost/api/trips/t1/messages/unread-count', () => HttpResponse.json({ count: 0 })),
    http.post('http://localhost/api/trips/t1/settlements', async ({ request }) => { sent = await request.json(); return HttpResponse.json({ id: 's1' }, { status: 201 }) }),
  )
  const router = renderWithProviders(
    [{ path: '/trips/:tripId', element: <TripLayout />, children: [
      { path: 'settlements/new', element: <SettlementFormPage /> },
      { path: 'balances', element: <h2>Saldi</h2> },
    ] }],
    '/trips/t1/settlements/new?from=p2&to=p1&amount=15.00',
  )
  await userEvent.setup().click(await screen.findByRole('button', { name: 'Conferma' }))
  expect(await screen.findByRole('heading', { name: 'Saldi' })).toBeInTheDocument()
  expect(sent).toMatchObject({ fromParticipantId: 'p2', toParticipantId: 'p1', amount: 15 })
  expect(router.state.historyAction).toBe('REPLACE')
})
