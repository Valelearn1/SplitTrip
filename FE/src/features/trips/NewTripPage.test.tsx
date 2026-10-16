import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { expect, it } from 'vitest'
import { renderWithProviders } from '../../test/renderWithProviders'
import { server } from '../../test/server'
import { AUTH_STORAGE_KEY } from '../auth/authContext'
import { NewTripPage } from './NewTripPage'

it('la valuta si sceglie da un menu, con EUR di default', async () => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: 't', user: { id: 'u1', email: 'v@e.it', displayName: 'Vale', hasAvatar: false } }))
  let sent: { currency?: string } = {}
  server.use(
    http.post('http://localhost/api/trips', async ({ request }) => {
      sent = (await request.json()) as { currency?: string }
      return HttpResponse.json({ id: 't9' }, { status: 201 })
    }),
    http.get('http://localhost/api/places', () => HttpResponse.json([{ name: 'New York', detail: 'Stati Uniti', latitude: 40.7143, longitude: -74.006 }])),
  )
  renderWithProviders([{ path: '/trips/new', element: <NewTripPage /> }, { path: '/trips/:tripId/benvenuto', element: <h1>Viaggio creato</h1> }], '/trips/new')
  const user = userEvent.setup()
  const currency = screen.getByRole('combobox', { name: 'Valuta' })
  expect(currency).toHaveValue('EUR')
  expect(screen.getByRole('option', { name: 'Euro (€)' })).toBeInTheDocument()
  await user.selectOptions(currency, 'USD')
  await user.type(screen.getByLabelText('Nome del viaggio'), 'New York')
  await user.type(screen.getByLabelText('Destinazione'), 'New York')
  await user.click(await screen.findByRole('option', { name: /New York/ }))
  await user.type(screen.getByLabelText('Partenza'), '2026-12-01')
  await user.type(screen.getByLabelText('Ritorno'), '2026-12-08')
  await user.click(screen.getByRole('button', { name: 'Crea viaggio' }))
  expect(await screen.findByRole('heading', { name: 'Viaggio creato' })).toBeInTheDocument()
  expect(sent.currency).toBe('USD')
})

it('scegliendo una proposta si inviano anche le coordinate', async () => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: 't', user: { id: 'u1', email: 'v@e.it', displayName: 'Vale', hasAvatar: false, preferredCurrency: 'EUR', chatSound: true, reduceMotion: false } }))
  let sent: unknown
  server.use(
    http.get('http://localhost/api/places', () => HttpResponse.json([{ name: 'Lisbona', detail: 'Portogallo', latitude: 38.7169, longitude: -9.1399 }])),
    http.post('http://localhost/api/trips', async ({ request }) => { sent = await request.json(); return HttpResponse.json({ id: 't9' }, { status: 201 }) }),
  )
  renderWithProviders([{ path: '/trips/new', element: <NewTripPage /> }, { path: '/trips/:id/benvenuto', element: <p>benvenuto</p> }, { path: '/trips/:id', element: <p>viaggio</p> }], '/trips/new')
  const user = userEvent.setup()
  await user.type(screen.getByLabelText('Nome del viaggio'), 'Lisbona 2026')
  await user.type(screen.getByRole('combobox', { name: 'Destinazione' }), 'lisb')
  await user.click(await screen.findByRole('option', { name: /Lisbona/ }))
  await user.type(screen.getByLabelText('Partenza'), '2026-11-01')
  await user.type(screen.getByLabelText('Ritorno'), '2026-11-06')
  await user.click(screen.getByRole('button', { name: 'Crea viaggio' }))
  await waitFor(() => expect(sent).toMatchObject({ destination: 'Lisbona', latitude: 38.7169, longitude: -9.1399 }))
})

it('la valuta parte da quella scelta nel Profilo (D-48)', async () => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: 't', user: { id: 'u1', email: 'v@e.it', displayName: 'Vale', hasAvatar: false, preferredCurrency: 'CHF', chatSound: true, reduceMotion: false } }))
  renderWithProviders([{ path: '/trips/new', element: <NewTripPage /> }], '/trips/new')
  expect(await screen.findByRole('combobox', { name: 'Valuta' })).toHaveValue('CHF')
})

it('senza scegliere una proposta il viaggio non parte: «Scegli la destinazione dall\'elenco»', async () => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: 't', user: { id: 'u1', email: 'v@e.it', displayName: 'Vale', hasAvatar: false } }))
  let posted = false
  server.use(
    http.post('http://localhost/api/trips', () => { posted = true; return HttpResponse.json({ id: 't9' }, { status: 201 }) }),
    http.get('http://localhost/api/places', () => HttpResponse.json([])),
  )
  renderWithProviders([{ path: '/trips/new', element: <NewTripPage /> }], '/trips/new')
  const user = userEvent.setup()
  await user.type(screen.getByLabelText('Nome del viaggio'), 'Ovunque')
  await user.type(screen.getByLabelText('Destinazione'), 'Un posto inventato')
  await user.type(screen.getByLabelText('Partenza'), '2026-12-01')
  await user.type(screen.getByLabelText('Ritorno'), '2026-12-08')
  await user.click(screen.getByRole('button', { name: 'Crea viaggio' }))
  expect(await screen.findByText('Scegli la destinazione dall\'elenco')).toBeInTheDocument()
  expect(posted).toBe(false)
})

it('se la ricerca dei luoghi non risponde lo dice', async () => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: 't', user: { id: 'u1', email: 'v@e.it', displayName: 'Vale', hasAvatar: false } }))
  server.use(http.get('http://localhost/api/places', () => HttpResponse.json(
    { status: 503, title: 'Luoghi non disponibili', detail: 'Ricerca dei luoghi non disponibile, riprova tra poco' }, { status: 503 })))
  renderWithProviders([{ path: '/trips/new', element: <NewTripPage /> }], '/trips/new')
  await userEvent.setup().type(screen.getByLabelText('Destinazione'), 'Lisbona')
  expect(await screen.findByText('Ricerca dei luoghi non disponibile, riprova tra poco')).toBeInTheDocument()
})
