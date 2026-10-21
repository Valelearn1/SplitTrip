import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { expect, it } from 'vitest'
import { renderWithProviders } from '../../test/renderWithProviders'
import { server } from '../../test/server'
import { AUTH_STORAGE_KEY } from '../auth/authContext'
import { TripLayout } from '../trips/TripLayout'
import { SettlementFormPage } from './SettlementFormPage'
import { expectAccessible } from '../../test/a11y'

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
  expect(await screen.findByLabelText('Importo')).toHaveClass('amount-input')   // stesso stile dell'importo grande della spesa
  await userEvent.setup().click(await screen.findByRole('button', { name: 'Conferma' }))
  expect(await screen.findByRole('heading', { name: 'Saldi' })).toBeInTheDocument()
  expect(sent).toMatchObject({ fromParticipantId: 'p2', toParticipantId: 'p1', amount: 15 })
  expect(router.state.historyAction).toBe('REPLACE')
  await expectAccessible()   // D-65
})

it('«Salda» in yen: l\'importo proposto si converte, si può correggere, sotto si vede l\'equivalente', async () => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: 't', user: { id: 'u2', email: 'g@e.it', displayName: 'Giulia' } }))
  let sent: unknown
  server.use(
    http.get('http://localhost/api/trips/t1', () => HttpResponse.json(trip)),
    http.get('http://localhost/api/rates', () => HttpResponse.json({ rate: 0.00562366, date: '2026-10-16' })),
    http.post('http://localhost/api/trips/t1/settlements', async ({ request }) => { sent = await request.json(); return HttpResponse.json({ id: 's1' }, { status: 201 }) }),
  )
  renderWithProviders([{ path: '/trips/:tripId', element: <TripLayout />, children: [{ path: 'settlements/new', element: <SettlementFormPage /> }, { path: 'balances', element: <h2>Saldi</h2> }] }], '/trips/t1/settlements/new?from=p2&to=p1&amount=30.00')
  const user = userEvent.setup()
  expect(await screen.findByLabelText('Importo')).toHaveValue('30,00')
  await user.selectOptions(screen.getByLabelText('Valuta'), 'JPY')
  expect(await screen.findByLabelText('Importo')).toHaveValue('5335')                 // 30 / 0.00562366, senza centesimi
  await user.clear(screen.getByLabelText('Importo'))
  await user.type(screen.getByLabelText('Importo'), '5000')
  expect(screen.getByText('≈ 28,12 €')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Conferma' }))
  expect(await screen.findByRole('heading', { name: 'Saldi' })).toBeInTheDocument()
  expect(sent).toMatchObject({ amount: 5000, currency: 'JPY', fxRate: 0.00562366 })
  await expectAccessible()
})
