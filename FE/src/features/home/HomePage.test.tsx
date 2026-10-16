import { screen, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { beforeEach, expect, it } from 'vitest'
import { renderWithProviders } from '../../test/renderWithProviders'
import { server } from '../../test/server'
import { AUTH_STORAGE_KEY } from '../auth/authContext'
import { HomePage } from './HomePage'

const summary = (id: string, name: string, status: string) => ({ id, name, destination: name, startDate: '2026-11-01', endDate: '2026-11-06', currency: 'EUR', status, memberCount: 3, myRole: 'MEMBER', latitude: null, longitude: null })

beforeEach(() => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: 't', user: { id: 'u1', email: 'v@e.it', displayName: 'Vale', hasAvatar: false, preferredCurrency: 'EUR', chatSound: true, reduceMotion: false } }))
  server.use(http.get('http://localhost/api/notifications/unread-count', () => HttpResponse.json({ count: 0 })))
})

it('viaggio in evidenza, conti, novità e azioni rapide', async () => {
  server.use(http.get('http://localhost/api/me/home', () => HttpResponse.json({
    featured: { trip: summary('t1', 'Lisbona 2026', 'ONGOING'), status: 'ONGOING', daysUntil: null, dayOfTotal: 3, totalDays: 6, coverPhotoId: null,
      weatherToday: { date: '2026-11-03', code: 61, tMin: 11, tMax: 17 }, myNet: 20 },
    balances: [{ tripId: 't1', tripName: 'Lisbona 2026', currency: 'EUR', myNet: 20 }, { tripId: 't2', tripName: 'Roma', currency: 'EUR', myNet: -15 }],
    totals: { toReceive: 20, toGive: 15, tripsToReceive: 1, tripsToGive: 1 },
    latestNotifications: [{ id: 'n1', tripId: 't1', type: 'EXPENSE_ADDED', message: 'Marco ha aggiunto «Cena»', link: '/trips/t1', readAt: null, createdAt: new Date().toISOString() }],
    trips: { current: [summary('t1', 'Lisbona 2026', 'ONGOING'), summary('t2', 'Roma', 'PLANNING')], past: [summary('t0', 'Berlino', 'CLOSED')] },
  })))
  renderWithProviders([{ path: '/trips', element: <HomePage /> }], '/trips')
  expect(await screen.findByRole('heading', { name: 'Ciao Vale' })).toBeInTheDocument()
  expect(await screen.findByText('In corso · giorno 3 di 6')).toBeInTheDocument() // il saluto c'è subito, i dati arrivano dopo
  expect(screen.getByText(/Pioggia/)).toBeInTheDocument()                     // meteo di oggi a parole
  expect(screen.getByRole('link', { name: 'Apri Lisbona 2026' })).toHaveAttribute('href', '/trips/t1')
  expect(screen.getByText('Devi ricevere')).toBeInTheDocument()
  expect(screen.getAllByText(/20,00\s€/).length).toBeGreaterThan(0)
  expect(screen.getAllByText('in 1 viaggio')).toHaveLength(2)                    // 1 viaggio da ricevere e 1 da dare
  expect(screen.getByRole('link', { name: 'Nuova spesa' })).toHaveAttribute('href', '/trips/t1/expenses/new')
  expect(screen.getByText('Marco ha aggiunto «Cena»')).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'In corso e in arrivo' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Passati' })).toBeInTheDocument()
  expect(screen.getAllByText('3 partecipanti')).toHaveLength(3)                // le card dei viaggi (dal vecchio TripsPage.test)
  const numbers = screen.getByRole('region', { name: 'I vostri viaggi in numeri' })
  expect(within(numbers).getByRole('link', { name: /Berlino/ })).toHaveAttribute('href', '/trips/t0/riepilogo')   // solo i passati
  expect(within(numbers).queryByRole('link', { name: /Lisbona/ })).not.toBeInTheDocument()
})

it('senza viaggi: stato vuoto con i due bottoni e niente «Nuova spesa»', async () => {
  server.use(http.get('http://localhost/api/me/home', () => HttpResponse.json({ featured: null, balances: [], totals: { toReceive: 0, toGive: 0, tripsToReceive: 0, tripsToGive: 0 }, latestNotifications: [], trips: { current: [], past: [] } })))
  renderWithProviders([{ path: '/trips', element: <HomePage /> }], '/trips')
  expect(await screen.findByText('Nessun viaggio ancora')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Crea il tuo primo viaggio' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Ho un codice' })).toBeInTheDocument()
  expect(screen.queryByRole('link', { name: 'Nuova spesa' })).not.toBeInTheDocument()
  expect(screen.getByText('Sei in pari con tutti')).toBeInTheDocument()
})

it('viaggio finito ma non chiuso: «da chiudere», e «Nuova spesa» segue lo stato calcolato dalle date', async () => {
  server.use(http.get('http://localhost/api/me/home', () => HttpResponse.json({
    featured: { trip: summary('t1', 'Lisbona 2026', 'PLANNING'), status: 'ENDED', daysUntil: null, dayOfTotal: null, totalDays: 6, coverPhotoId: null, weatherToday: null, myNet: 0 },
    balances: [], totals: { toReceive: 0, toGive: 0, tripsToReceive: 0, tripsToGive: 0 }, latestNotifications: [],
    trips: { current: [summary('t1', 'Lisbona 2026', 'PLANNING')], past: [] },
  })))
  renderWithProviders([{ path: '/trips', element: <HomePage /> }], '/trips')
  expect(await screen.findByText('Finito il 6 nov 2026 · da chiudere')).toBeInTheDocument()
  expect(screen.queryByRole('link', { name: 'Nuova spesa' })).not.toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Il vostro viaggio in numeri' })).toHaveAttribute('href', '/trips/t1/riepilogo')
})

it('viaggio in corso rimasto «in pianificazione»: «Nuova spesa» c’è lo stesso', async () => {
  server.use(http.get('http://localhost/api/me/home', () => HttpResponse.json({
    featured: { trip: summary('t1', 'Lisbona 2026', 'PLANNING'), status: 'ONGOING', daysUntil: null, dayOfTotal: 2, totalDays: 6, coverPhotoId: null, weatherToday: null, myNet: 0 },
    balances: [], totals: { toReceive: 0, toGive: 0, tripsToReceive: 0, tripsToGive: 0 }, latestNotifications: [],
    trips: { current: [summary('t1', 'Lisbona 2026', 'PLANNING')], past: [] },
  })))
  renderWithProviders([{ path: '/trips', element: <HomePage /> }], '/trips')
  expect(await screen.findByRole('link', { name: 'Nuova spesa' })).toHaveAttribute('href', '/trips/t1/expenses/new')
})
