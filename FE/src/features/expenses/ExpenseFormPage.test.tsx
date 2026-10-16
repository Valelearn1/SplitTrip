import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '../../test/renderWithProviders'
import { server } from '../../test/server'
import { AUTH_STORAGE_KEY } from '../auth/authContext'
import { TripLayout } from '../trips/TripLayout'
import { formatMoney } from '../../shared/utils/format'
import { ExpenseFormPage } from './ExpenseFormPage'

// Intl separa importo e valuta con uno spazio non separabile; Testing Library confronta il testo con spazi normali
const money = (n: number, c: string) => formatMoney(n, c).replace(/\s/g, ' ')

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

  it('parti uguali con chi conta per 2: precompilato dal partecipante, spiegato e inviato come WEIGHT', async () => {
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
    expect(screen.queryByRole('radio', { name: 'Pesi' })).not.toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Parti uguali' })).toBeChecked()
    // Marco rappresenta due persone (impostato in «La mia partecipazione»): la scelta è già visibile e spiegata
    expect(within(screen.getByRole('group', { name: 'Marco conta per' })).getByRole('radio', { name: '2' })).toBeChecked()
    expect(screen.getByText('Marco conta per 2: 60,00 € invece di 45,00 €')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Salva/ }))
    expect(await screen.findByRole('heading', { name: 'Lista spese' })).toBeInTheDocument()
    expect(sent).toMatchObject({ splitType: 'WEIGHT', shares: [{ participantId: 'p1', weight: 1 }, { participantId: 'p2', weight: 2 }] })
    expect(sent).not.toHaveProperty('dayBasis')
  })

  it('«Qualcuno conta per più di una persona?» apre la scelta; ½ per un bambino', async () => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: 't', user: { id: 'u2', email: 'm@e.it', displayName: 'Marco' } }))
    let sent: unknown
    server.use(
      http.get('http://localhost/api/trips/t1', () => HttpResponse.json(trip)),
      http.post('http://localhost/api/trips/t1/expenses', async ({ request }) => { sent = await request.json(); return HttpResponse.json({ id: 'e1' }, { status: 201 }) }),
    )
    renderWithProviders([{ path: '/trips/:tripId', element: <TripLayout />, children: [{ path: 'expenses/new', element: <ExpenseFormPage /> }, { path: 'expenses', element: <h2>Lista spese</h2> }] }], '/trips/t1/expenses/new')
    const user = userEvent.setup()
    await user.type(await screen.findByLabelText('Importo'), '90')
    await user.type(screen.getByLabelText('Descrizione'), 'Gelati')
    expect(screen.getByText(/Quota a testa/)).toBeInTheDocument()
    expect(screen.queryByRole('group', { name: 'Vale conta per' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Qualcuno conta per più di una persona?' }))
    await user.click(within(screen.getByRole('group', { name: 'Vale conta per' })).getByRole('radio', { name: '½' }))
    expect(screen.getByText('Vale conta per ½: 30,00 € invece di 45,00 €')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Salva/ }))
    expect(await screen.findByRole('heading', { name: 'Lista spese' })).toBeInTheDocument()
    expect(sent).toMatchObject({ splitType: 'WEIGHT', shares: [{ participantId: 'p1', weight: 0.5 }, { participantId: 'p2', weight: 1 }] })
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

  it('un «conta per» scritto a mano non diventa «giorni» passando a Presenza', async () => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: 't', user: { id: 'u2', email: 'm@e.it', displayName: 'Marco' } }))
    server.use(http.get('http://localhost/api/trips/t1', () => HttpResponse.json(tripWeights)))
    renderWithProviders([{ path: '/trips/:tripId', element: <TripLayout />, children: [{ path: 'expenses/new', element: <ExpenseFormPage /> }] }], '/trips/t1/expenses/new')
    const user = userEvent.setup()
    await user.click(within(await screen.findByRole('group', { name: 'Vale conta per' })).getByRole('radio', { name: 'altro' }))
    await user.clear(screen.getByLabelText('Vale conta per (numero)'))
    await user.type(screen.getByLabelText('Vale conta per (numero)'), '7')
    await user.click(screen.getByRole('radio', { name: 'Presenza' }))
    expect(screen.getByLabelText('Giorni di Vale')).toHaveValue('3') // presenza reale: arriva il 3, viaggio 1–5
  })

  it('una spesa per peso già salvata si apre come parti uguali e, passata a Presenza, propone notti dalle date', async () => {
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
    // una spesa «per peso» di prima si apre come Parti uguali con i suoi «conta per»
    expect(await screen.findByRole('radio', { name: 'Parti uguali' })).toBeChecked()
    expect(within(screen.getByRole('group', { name: 'Marco conta per' })).getByRole('radio', { name: '2' })).toBeChecked()
    await user.click(screen.getByRole('radio', { name: 'Presenza' }))
    expect(screen.getByLabelText('Notti di Vale')).toHaveValue('2')
    expect(screen.getByLabelText('Notti di Marco')).toHaveValue('4')
  })

  it('aperta da «Chi offre?» ha pagante, partecipanti, categoria e data già scelti', async () => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: 't', user: { id: 'u1', email: 'v@e.it', displayName: 'Vale' } }))
    const tripThree = { ...trip, participants: [...trip.participants,
      { id: 'p3', userId: null, displayName: 'Nonna Pina', role: 'MEMBER', defaultWeight: 1, arrivalDate: null, departureDate: null }] }
    server.use(http.get('http://localhost/api/trips/t1', () => HttpResponse.json(tripThree)))
    renderWithProviders(
      [{ path: '/trips/:tripId', element: <TripLayout />, children: [{ path: 'expenses/new', element: <ExpenseFormPage /> }] }],
      { pathname: '/trips/t1/expenses/new', state: { prefill: { payerId: 'p2', participantIds: ['p1', 'p2'], category: 'ACTIVITY', date: '2026-11-03', description: 'Gelato' } } },
    )
    expect(await screen.findByLabelText('Descrizione')).toHaveValue('Gelato')
    const payer = screen.getByRole('group', { name: 'Chi ha pagato?' })
    expect(within(payer).getByRole('radio', { name: /Marco/ })).toBeChecked()
    expect(within(payer).getByRole('radio', { name: /Tu/ })).not.toBeChecked()
    expect(screen.getByRole('radio', { name: 'Attività' })).toBeChecked()
    expect(screen.getByLabelText('Data')).toHaveValue('2026-11-03')
    expect(screen.getByRole('checkbox', { name: /Marco/ })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: /Tu \(io\)/ })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: /Nonna Pina/ })).not.toBeChecked()   // non era nella ruota
  })

  it('quota a testa e «Salva» usano la valuta del viaggio, non sempre l\'euro', async () => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: 't', user: { id: 'u1', email: 'v@e.it', displayName: 'Vale' } }))
    server.use(http.get('http://localhost/api/trips/t1', () => HttpResponse.json({ ...trip, currency: 'JPY' })))
    renderWithProviders(
      [{ path: '/trips/:tripId', element: <TripLayout />, children: [{ path: 'expenses/new', element: <ExpenseFormPage /> }] }],
      '/trips/t1/expenses/new',
    )
    await userEvent.setup().type(await screen.findByLabelText('Importo'), '2000')
    expect(screen.getByText(money(1000, 'JPY'))).toBeInTheDocument()                       // quota a testa, in due
    expect(screen.getByRole('button', { name: /Salva/ })).toHaveTextContent(money(2000, 'JPY'))
    expect(screen.queryByText(/€/)).not.toBeInTheDocument()
  })
})
