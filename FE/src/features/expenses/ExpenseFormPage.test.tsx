import { act, screen, within } from '@testing-library/react'
import { focusManager, onlineManager } from '@tanstack/react-query'
import userEvent from '@testing-library/user-event'
import { delay, http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '../../test/renderWithProviders'
import { server } from '../../test/server'
import { AUTH_STORAGE_KEY } from '../auth/authContext'
import { TripLayout } from '../trips/TripLayout'
import { formatMoney } from '../../shared/utils/format'
import { ExpenseFormPage } from './ExpenseFormPage'
import { expectAccessible } from '../../test/a11y'

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
    expect(router.state.historyAction).toBe('REPLACE')                         // «Indietro» non riapre il modulo salvato
    await expectAccessible()   // D-65
  })

  it('chi è entrato da poco è nella divisione anche se il viaggio era già in memoria (trovato dal giro e2e, D-66)', async () => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: 't', user: { id: 'u1', email: 'v@e.it', displayName: 'Vale' } }))
    let sent: unknown
    server.use(http.get('http://localhost/api/trips/t1', () => HttpResponse.json({ ...trip, participants: [trip.participants[0]] })))
    const router = renderWithProviders(
      [{ path: '/trips/:tripId', element: <TripLayout />, children: [
        { index: true, element: <h2>Panoramica</h2> },
        { path: 'expenses/new', element: <ExpenseFormPage /> },
        { path: 'expenses', element: <h2>Lista spese</h2> },
      ] }],
      '/trips/t1',
    )
    expect(await screen.findByRole('heading', { name: 'Panoramica' })).toBeInTheDocument()   // il viaggio è in memoria con la sola Vale
    server.use(   // intanto Marco entra col codice
      http.get('http://localhost/api/trips/t1', () => HttpResponse.json(trip)),
      http.post('http://localhost/api/trips/t1/expenses', async ({ request }) => { sent = await request.json(); return HttpResponse.json({ id: 'e1' }, { status: 201 }) }),
    )
    await act(() => router.navigate('/trips/t1/expenses/new'))
    const user = userEvent.setup()
    await user.type(await screen.findByLabelText('Importo'), '60')
    await user.type(screen.getByLabelText('Descrizione'), 'Cena')
    await user.click(screen.getByRole('button', { name: 'Salva' }))
    expect(await screen.findByRole('heading', { name: 'Panoramica' })).toBeInTheDocument()   // torna da dove si era partiti
    expect(sent).toMatchObject({ shares: [{ participantId: 'p1' }, { participantId: 'p2' }] })
  })

  it('un aggiornamento del viaggio mentre si scrive non cancella il modulo', async () => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: 't', user: { id: 'u2', email: 'm@e.it', displayName: 'Marco' } }))
    server.use(http.get('http://localhost/api/trips/t1', async () => { await new Promise((r) => setTimeout(r, 50)); return HttpResponse.json(trip) }))
    renderWithProviders([{ path: '/trips/:tripId', element: <TripLayout />, children: [{ path: 'expenses/new', element: <ExpenseFormPage /> }] }], '/trips/t1/expenses/new')
    const user = userEvent.setup()
    await user.type(await screen.findByLabelText('Importo'), '60')
    act(() => { focusManager.setFocused(false); focusManager.setFocused(true) })   // come un evento dal vivo: il viaggio si rilegge
    await act(() => new Promise((r) => setTimeout(r, 150)))
    expect(screen.getByLabelText('Importo')).toHaveValue('60')
    act(() => focusManager.setFocused(undefined))
  })

  const fromOverview = () => renderWithProviders(
    [{ path: '/trips/:tripId', element: <TripLayout />, children: [
      { index: true, element: <h2>Panoramica</h2> },
      { path: 'expenses/new', element: <ExpenseFormPage /> },
    ] }],
    '/trips/t1',
  )

  it('aperto senza rete: quando la rete torna, quello che si è scritto resta (revisione v3.4)', async () => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: 't', user: { id: 'u1', email: 'v@e.it', displayName: 'Vale' } }))
    server.use(http.get('http://localhost/api/trips/t1', () => HttpResponse.json(trip)))
    const router = fromOverview()
    expect(await screen.findByRole('heading', { name: 'Panoramica' })).toBeInTheDocument()
    act(() => onlineManager.setOnline(false))
    await act(() => router.navigate('/trips/t1/expenses/new'))
    const user = userEvent.setup()
    await user.type(await screen.findByLabelText('Importo'), '60')
    server.use(http.get('http://localhost/api/trips/t1', async () => { await delay(150); return HttpResponse.json(trip) }))   // una rete vera non è istantanea
    act(() => onlineManager.setOnline(true))   // la rilettura in pausa riparte
    await act(() => new Promise((r) => setTimeout(r, 400)))
    expect(screen.getByLabelText('Importo')).toHaveValue('60')
  })

  it('con una rete che non risponde il modulo si apre lo stesso dopo pochi secondi (revisione v3.4)', async () => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: 't', user: { id: 'u1', email: 'v@e.it', displayName: 'Vale' } }))
    server.use(http.get('http://localhost/api/trips/t1', () => HttpResponse.json(trip)))
    const router = fromOverview()
    expect(await screen.findByRole('heading', { name: 'Panoramica' })).toBeInTheDocument()
    server.use(http.get('http://localhost/api/trips/t1', async () => { await delay('infinite'); return HttpResponse.json(trip) }))
    await act(() => router.navigate('/trips/t1/expenses/new'))
    expect(await screen.findByLabelText('Importo', {}, { timeout: 4500 })).toBeInTheDocument()
  }, 8000)

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
    expect(screen.queryAllByText(/€/).filter((el) => el.tagName !== 'OPTION')).toHaveLength(0)   // l'euro c'è solo fra le valute del menu (D-69)
  })

  it('salvata, si torna da dove si era partiti (qui la panoramica), senza voci doppie', async () => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: 't', user: { id: 'u2', email: 'm@e.it', displayName: 'Marco' } }))
    server.use(
      http.get('http://localhost/api/trips/t1', () => HttpResponse.json(trip)),
      http.post('http://localhost/api/trips/t1/expenses', () => HttpResponse.json({ id: 'e1' }, { status: 201 })),
    )
    const router = renderWithProviders(
      [{ path: '/trips/:tripId', element: <TripLayout />, children: [
        { index: true, element: <h2>Panoramica</h2> },
        { path: 'expenses/new', element: <ExpenseFormPage /> },
      ] }],
      ['/trips/t1', '/trips/t1/expenses/new'],
    )
    const user = userEvent.setup()
    await user.type(await screen.findByLabelText('Importo'), '12')
    await user.type(screen.getByLabelText('Descrizione'), 'Caffè')
    await user.click(screen.getByRole('button', { name: /Salva/ }))
    expect(await screen.findByRole('heading', { name: 'Panoramica' })).toBeInTheDocument()
    expect(router.state.historyAction).toBe('POP')
  })

  it('nell\'importo entrano solo cifre, una virgola, due decimali e sei cifre intere', async () => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: 't', user: { id: 'u1', email: 'v@e.it', displayName: 'Vale' } }))
    server.use(http.get('http://localhost/api/trips/t1', () => HttpResponse.json(trip)))
    renderWithProviders(
      [{ path: '/trips/:tripId', element: <TripLayout />, children: [{ path: 'expenses/new', element: <ExpenseFormPage /> }] }],
      '/trips/t1/expenses/new',
    )
    const user = userEvent.setup()
    const amount = await screen.findByLabelText('Importo')
    await user.type(amount, '12a,345')
    expect(amount).toHaveValue('12,34')
    await user.clear(amount)
    await user.type(amount, '12345678')
    expect(amount).toHaveValue('123456')
  })

  it('un punto di troppo non sposta la virgola; i punti delle migliaia spariscono uscendo; incollare oltre il tetto lo dice', async () => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: 't', user: { id: 'u1', email: 'v@e.it', displayName: 'Vale' } }))
    server.use(http.get('http://localhost/api/trips/t1', () => HttpResponse.json(trip)))
    renderWithProviders(
      [{ path: '/trips/:tripId', element: <TripLayout />, children: [{ path: 'expenses/new', element: <ExpenseFormPage /> }] }],
      '/trips/t1/expenses/new',
    )
    const user = userEvent.setup()
    const amount = await screen.findByLabelText('Importo')
    await user.type(amount, '12,50.')
    expect(amount).toHaveValue('12,50')
    await user.clear(amount)
    await user.type(amount, '1.234,56')
    expect(amount).toHaveValue('1.234,56')
    await user.tab()
    expect(amount).toHaveValue('1234,56')
    await user.clear(amount)
    await user.paste('1.000.000,00')
    expect(amount).toHaveValue('1000000,00')
    await user.type(screen.getByLabelText('Descrizione'), 'Villa')
    await user.click(screen.getByRole('button', { name: /Salva/ }))
    expect(await screen.findByText('Al massimo 999.999,99')).toBeInTheDocument()
  })

  it('la rete cade durante il salvataggio: niente in coda, messaggio chiaro, campi ancora compilati', async () => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: 't', user: { id: 'u1', email: 'v@e.it', displayName: 'Vale' } }))
    let calls = 0
    server.use(
      http.get('http://localhost/api/trips/t1', () => HttpResponse.json(trip)),
      http.post('http://localhost/api/trips/t1/expenses', () => { calls++; onlineManager.setOnline(false); return HttpResponse.error() }),
    )
    renderWithProviders(
      [{ path: '/trips/:tripId', element: <TripLayout />, children: [{ path: 'expenses/new', element: <ExpenseFormPage /> }] }],
      '/trips/t1/expenses/new',
    )
    const user = userEvent.setup()
    await user.type(await screen.findByLabelText('Importo'), '12')
    await user.type(screen.getByLabelText('Descrizione'), 'Gelato')
    await user.click(screen.getByRole('button', { name: /Salva/ }))
    expect(await screen.findByText('Connessione persa: la modifica potrebbe non essere stata salvata. Controlla prima di riprovare')).toBeInTheDocument()
    expect(screen.getByLabelText('Descrizione')).toHaveValue('Gelato')
    act(() => onlineManager.setOnline(true))
    await new Promise((r) => setTimeout(r, 300))
    expect(calls).toBe(1)                                                    // nessun invio automatico al ritorno della rete
  })

  it('un tasto rifiutato in mezzo al numero non sposta il cursore in fondo', async () => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: 't', user: { id: 'u1', email: 'v@e.it', displayName: 'Vale' } }))
    server.use(http.get('http://localhost/api/trips/t1', () => HttpResponse.json(trip)))
    renderWithProviders(
      [{ path: '/trips/:tripId', element: <TripLayout />, children: [{ path: 'expenses/new', element: <ExpenseFormPage /> }] }],
      '/trips/t1/expenses/new',
    )
    const user = userEvent.setup()
    const amount = await screen.findByLabelText('Importo') as HTMLInputElement
    await user.type(amount, '1234')
    await user.type(amount, 'x', { initialSelectionStart: 2, initialSelectionEnd: 2 })
    expect(amount).toHaveValue('1234')
    expect(amount.selectionStart).toBe(2)
  })

  it('spesa in yen: cambio proposto, anteprima «≈ 11,25 €», invio con currency e fxRate; la valuta resta per la prossima', async () => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: 't', user: { id: 'u1', email: 'v@e.it', displayName: 'Vale' } }))
    let sent: unknown
    server.use(
      http.get('http://localhost/api/trips/t1', () => HttpResponse.json(trip)),
      http.get('http://localhost/api/rates', () => HttpResponse.json({ rate: 0.00562366, date: '2026-10-16' })),
      http.post('http://localhost/api/trips/t1/expenses', async ({ request }) => { sent = await request.json(); return HttpResponse.json({ id: 'e1' }, { status: 201 }) }),
    )
    renderWithProviders([{ path: '/trips/:tripId', element: <TripLayout />, children: [{ path: 'expenses/new', element: <ExpenseFormPage /> }, { path: 'expenses', element: <h2>Lista spese</h2> }] }], '/trips/t1/expenses/new')
    const user = userEvent.setup()
    await user.selectOptions(await screen.findByLabelText('Valuta'), 'JPY')
    expect(await screen.findByText('Cambio del 16 ott (BCE): 1 € = 177,82 JPY')).toBeInTheDocument()
    await user.type(screen.getByLabelText('Importo'), '2000')
    expect(screen.getByText('≈ 11,25 €')).toBeInTheDocument()
    await user.type(screen.getByLabelText('Descrizione'), 'Cena')
    await user.click(screen.getByRole('button', { name: /^Salva/ }))
    expect(await screen.findByRole('heading', { name: 'Lista spese' })).toBeInTheDocument()
    expect(sent).toMatchObject({ amount: 2000, currency: 'JPY', fxRate: 0.00562366 })
    expect(localStorage.getItem('splittrip:currency:t1')).toBe('JPY')
    await expectAccessible()
  })

  it('cambio scritto a mano «0»: non si salva e lo dice', async () => {                       // Review Focus 1
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: 't', user: { id: 'u1', email: 'v@e.it', displayName: 'Vale' } }))
    server.use(
      http.get('http://localhost/api/trips/t1', () => HttpResponse.json(trip)),
      http.get('http://localhost/api/rates', () => HttpResponse.json({ title: 'x', detail: 'Cambio non disponibile per MAD: scrivilo a mano' }, { status: 404 })),
    )
    renderWithProviders([{ path: '/trips/:tripId', element: <TripLayout />, children: [{ path: 'expenses/new', element: <ExpenseFormPage /> }] }], '/trips/t1/expenses/new')
    const user = userEvent.setup()
    await user.selectOptions(await screen.findByLabelText('Valuta'), 'MAD')
    await user.type(await screen.findByLabelText('1 € = … MAD'), '0')
    await user.type(screen.getByLabelText('Importo'), '100')
    await user.type(screen.getByLabelText('Descrizione'), 'Tè')
    await user.click(screen.getByRole('button', { name: /^Salva/ }))
    expect(await screen.findByText('Scrivi quanti MAD vale 1 €')).toBeInTheDocument()
  })

  it('modifica di una spesa in euro: nessuna riga del cambio, invio con fxRate 1', async () => {   // Review Focus 3
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: 't', user: { id: 'u1', email: 'v@e.it', displayName: 'Vale' } }))
    let sent: unknown
    server.use(
      http.get('http://localhost/api/trips/t1', () => HttpResponse.json(trip)),
      http.get('http://localhost/api/trips/t1/expenses/e1', () => HttpResponse.json({
        id: 'e1', description: 'Taxi', amount: 30, currency: 'EUR', fxRate: 1, amountBase: 30, date: '2026-11-02', category: 'TRANSPORT',
        splitType: 'EQUAL', dayBasis: null, payerId: 'p1', payerName: 'Vale', createdBy: 'u1', createdAt: '2026-11-02T10:00:00Z', receiptPhotoId: null,
        shares: [{ participantId: 'p1', displayName: 'Vale', amount: 15, weight: null }, { participantId: 'p2', displayName: 'Marco', amount: 15, weight: null }],
      })),
      http.put('http://localhost/api/trips/t1/expenses/e1', async ({ request }) => { sent = await request.json(); return HttpResponse.json({ id: 'e1' }) }),
    )
    renderWithProviders([{ path: '/trips/:tripId', element: <TripLayout />, children: [{ path: 'expenses/:expenseId/edit', element: <ExpenseFormPage /> }, { path: 'expenses', element: <h2>Lista spese</h2> }] }], '/trips/t1/expenses/e1/edit')
    expect(await screen.findByLabelText('Importo')).toHaveValue('30,00')
    expect(screen.queryByText(/Cambio del/)).not.toBeInTheDocument()
    await userEvent.setup().click(screen.getByRole('button', { name: /^Salva/ }))
    expect(await screen.findByRole('heading', { name: 'Lista spese' })).toBeInTheDocument()
    expect(sent).toMatchObject({ amount: 30, currency: 'EUR', fxRate: 1 })
  })

  it('modifica di una spesa in yen: il cambio salvato resta, senza chiamare il servizio', async () => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: 't', user: { id: 'u1', email: 'v@e.it', displayName: 'Vale' } }))
    let rateCalls = 0
    server.use(
      http.get('http://localhost/api/trips/t1', () => HttpResponse.json(trip)),
      http.get('http://localhost/api/rates', () => { rateCalls++; return HttpResponse.json({ rate: 0.009, date: '2026-10-16' }) }),
      http.get('http://localhost/api/trips/t1/expenses/e1', () => HttpResponse.json({
        id: 'e1', description: 'Cena', amount: 2000, currency: 'JPY', fxRate: 0.00562366, amountBase: 11.25, date: '2026-11-02', category: 'FOOD',
        splitType: 'EQUAL', dayBasis: null, payerId: 'p1', payerName: 'Vale', createdBy: 'u1', createdAt: '2026-11-02T10:00:00Z', receiptPhotoId: null,
        shares: [{ participantId: 'p1', displayName: 'Vale', amount: 5.63, weight: null }, { participantId: 'p2', displayName: 'Marco', amount: 5.62, weight: null }],
      })),
    )
    renderWithProviders([{ path: '/trips/:tripId', element: <TripLayout />, children: [{ path: 'expenses/:expenseId/edit', element: <ExpenseFormPage /> }] }], '/trips/t1/expenses/e1/edit')
    expect(await screen.findByLabelText('Importo')).toHaveValue('2000')
    expect(screen.getByLabelText('1 € = … JPY')).toHaveValue('177,82')
    expect(screen.getByText('≈ 11,25 €')).toBeInTheDocument()
    expect(rateCalls).toBe(0)
  })

  it('modifica di una spesa in yen con quote personalizzate: le quote tornano in yen come sullo scontrino', async () => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: 't', user: { id: 'u1', email: 'v@e.it', displayName: 'Vale' } }))
    server.use(
      http.get('http://localhost/api/trips/t1', () => HttpResponse.json(trip)),
      http.get('http://localhost/api/trips/t1/expenses/e1', () => HttpResponse.json({
        id: 'e1', description: 'Cena', amount: 2000, currency: 'JPY', fxRate: 0.00562366, amountBase: 11.25, date: '2026-11-02', category: 'FOOD',
        splitType: 'CUSTOM', dayBasis: null, payerId: 'p1', payerName: 'Vale', createdBy: 'u1', createdAt: '2026-11-02T10:00:00Z', receiptPhotoId: null,
        shares: [{ participantId: 'p1', displayName: 'Vale', amount: 6.75, weight: null }, { participantId: 'p2', displayName: 'Marco', amount: 4.5, weight: null }],
      })),
    )
    renderWithProviders([{ path: '/trips/:tripId', element: <TripLayout />, children: [{ path: 'expenses/:expenseId/edit', element: <ExpenseFormPage /> }] }], '/trips/t1/expenses/e1/edit')
    expect(await screen.findByLabelText('Quota di Vale')).toHaveValue('1200')
    expect(screen.getByLabelText('Quota di Marco')).toHaveValue('800')
  })

  it('«Quota a testa» in yen è già convertita nella valuta del viaggio (revisione v3.6)', async () => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: 't', user: { id: 'u1', email: 'v@e.it', displayName: 'Vale' } }))
    server.use(
      http.get('http://localhost/api/trips/t1', () => HttpResponse.json(trip)),
      http.get('http://localhost/api/rates', () => HttpResponse.json({ rate: 0.00562366, date: '2026-10-16' })),
    )
    renderWithProviders([{ path: '/trips/:tripId', element: <TripLayout />, children: [{ path: 'expenses/new', element: <ExpenseFormPage /> }] }], '/trips/t1/expenses/new')
    const user = userEvent.setup()
    await user.selectOptions(await screen.findByLabelText('Valuta'), 'JPY')
    await screen.findByText('Cambio del 16 ott (BCE): 1 € = 177,82 JPY')
    await user.type(screen.getByLabelText('Importo'), '2000')
    expect(screen.getByText(/Quota a testa/)).toHaveTextContent(/5,62\s€/)
    expect(screen.queryByText(/1\.000,00\s€/)).not.toBeInTheDocument()
  })
})

