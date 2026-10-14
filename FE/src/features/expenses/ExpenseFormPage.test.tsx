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

const tripWeights = {
  ...trip,
  participants: [
    { id: 'p1', userId: 'u1', displayName: 'Vale', role: 'ORGANIZER', defaultWeight: 1, arrivalDate: '2026-11-03', departureDate: null },
    { id: 'p2', userId: 'u2', displayName: 'Marco', role: 'MEMBER', defaultWeight: 2, arrivalDate: null, departureDate: null },
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

  it('per peso: pesi precompilati, anteprima della quota e invio con weight', async () => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: 't', user: { id: 'u2', email: 'm@e.it', displayName: 'Marco' } }))
    let sent: unknown
    server.use(
      http.get('http://localhost/api/trips/t1', () => HttpResponse.json(tripWeights)),
      http.post('http://localhost/api/trips/t1/expenses', async ({ request }) => { sent = await request.json(); return HttpResponse.json({ id: 'e1' }, { status: 201 }) }),
    )
    renderWithProviders([{ path: '/trips/:tripId', element: <TripLayout />, children: [{ path: 'expenses/new', element: <ExpenseFormPage /> }, { path: 'expenses', element: <h2>Lista spese</h2> }] }], '/trips/t1/expenses/new')
    const user = userEvent.setup()
    await user.type(await screen.findByLabelText('Importo'), '90')
    await user.type(screen.getByLabelText('Descrizione'), 'Cena')
    await user.click(screen.getByRole('radio', { name: 'Pesi' }))
    expect(screen.getByLabelText('Peso di Marco')).toHaveValue('2')
    expect(screen.getByLabelText('Peso di Vale')).toHaveValue('1')
    expect(screen.getByText(/60,00\s€/)).toBeInTheDocument() // anteprima: 90 × 2/3
    await user.click(screen.getByRole('button', { name: /Salva/ }))
    expect(await screen.findByRole('heading', { name: 'Lista spese' })).toBeInTheDocument()
    expect(sent).toMatchObject({ splitType: 'WEIGHT', shares: [{ participantId: 'p1', weight: 1 }, { participantId: 'p2', weight: 2 }] })
    expect(sent).not.toHaveProperty('dayBasis')
  })

  it('per presenza: notti dalla categoria alloggio, ricalcolo se non toccate', async () => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: 't', user: { id: 'u2', email: 'm@e.it', displayName: 'Marco' } }))
    let sent: unknown
    server.use(
      http.get('http://localhost/api/trips/t1', () => HttpResponse.json(tripWeights)),
      http.post('http://localhost/api/trips/t1/expenses', async ({ request }) => { sent = await request.json(); return HttpResponse.json({ id: 'e1' }, { status: 201 }) }),
    )
    renderWithProviders([{ path: '/trips/:tripId', element: <TripLayout />, children: [{ path: 'expenses/new', element: <ExpenseFormPage /> }, { path: 'expenses', element: <h2>Lista spese</h2> }] }], '/trips/t1/expenses/new')
    const user = userEvent.setup()
    await user.type(await screen.findByLabelText('Importo'), '500')
    await user.type(screen.getByLabelText('Descrizione'), 'Casa')
    await user.click(screen.getByRole('radio', { name: 'Alloggio' }))
    await user.click(screen.getByRole('radio', { name: 'Presenza' }))
    expect(screen.getByRole('radio', { name: 'Notti' })).toBeChecked()
    expect(screen.getByLabelText('Notti di Vale')).toHaveValue('2')   // arriva il 3, viaggio 1–5 → 2 notti
    expect(screen.getByLabelText('Notti di Marco')).toHaveValue('4')
    await user.click(screen.getByRole('radio', { name: 'Giorni' }))
    expect(screen.getByLabelText('Giorni di Vale')).toHaveValue('3')
    await user.clear(screen.getByLabelText('Giorni di Vale'))
    await user.type(screen.getByLabelText('Giorni di Vale'), '1')
    await user.click(screen.getByRole('radio', { name: 'Notti' }))
    expect(screen.getByLabelText('Notti di Vale')).toHaveValue('1')   // toccato a mano: non si ricalcola
    await user.click(screen.getByRole('button', { name: /Salva/ }))
    expect(await screen.findByRole('heading', { name: 'Lista spese' })).toBeInTheDocument()
    expect(sent).toMatchObject({ splitType: 'DAYS', dayBasis: 'NIGHTS', shares: [{ participantId: 'p1', weight: 1 }, { participantId: 'p2', weight: 4 }] })
  })

  it('un peso scritto in Pesi non diventa «giorni» passando a Presenza', async () => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: 't', user: { id: 'u2', email: 'm@e.it', displayName: 'Marco' } }))
    server.use(http.get('http://localhost/api/trips/t1', () => HttpResponse.json(tripWeights)))
    renderWithProviders([{ path: '/trips/:tripId', element: <TripLayout />, children: [{ path: 'expenses/new', element: <ExpenseFormPage /> }] }], '/trips/t1/expenses/new')
    const user = userEvent.setup()
    await user.click(await screen.findByRole('radio', { name: 'Pesi' }))
    await user.clear(screen.getByLabelText('Peso di Vale'))
    await user.type(screen.getByLabelText('Peso di Vale'), '7')
    await user.click(screen.getByRole('radio', { name: 'Presenza' }))
    expect(screen.getByLabelText('Giorni di Vale')).toHaveValue('3') // presenza reale: arriva il 3, viaggio 1–5
  })

  it('una spesa per peso già salvata, passata a Presenza, propone notti dalle date', async () => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: 't', user: { id: 'u2', email: 'm@e.it', displayName: 'Marco' } }))
    const saved = {
      id: 'e1', description: 'Casa', amount: 300, currency: 'EUR', date: '2026-11-01', category: 'LODGING', splitType: 'WEIGHT', dayBasis: null,
      payerId: 'p2', payerName: 'Marco', createdBy: 'u2', createdAt: '2026-11-01T10:00:00Z',
      shares: [{ participantId: 'p1', displayName: 'Vale', amount: 100, weight: 1 }, { participantId: 'p2', displayName: 'Marco', amount: 200, weight: 2 }],
    }
    server.use(
      http.get('http://localhost/api/trips/t1', () => HttpResponse.json(tripWeights)),
      http.get('http://localhost/api/trips/t1/expenses/e1', () => HttpResponse.json(saved)),
    )
    renderWithProviders([{ path: '/trips/:tripId', element: <TripLayout />, children: [{ path: 'expenses/:expenseId/edit', element: <ExpenseFormPage /> }] }], '/trips/t1/expenses/e1/edit')
    const user = userEvent.setup()
    expect(await screen.findByLabelText('Peso di Marco')).toHaveValue('2') // in Pesi restano i pesi salvati
    await user.click(screen.getByRole('radio', { name: 'Presenza' }))
    expect(screen.getByLabelText('Notti di Vale')).toHaveValue('2')
    expect(screen.getByLabelText('Notti di Marco')).toHaveValue('4')
  })
})
