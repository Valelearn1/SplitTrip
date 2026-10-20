import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { beforeEach, expect, it, vi } from 'vitest'
import { renderWithProviders } from '../../test/renderWithProviders'
import { server } from '../../test/server'
import { AUTH_STORAGE_KEY } from '../auth/authContext'
import { ProfilePage } from './ProfilePage'
import { expectAccessible } from '../../test/a11y'

vi.mock('../photos/PointsMap', () => ({ PointsMap: ({ points }: { points: { name: string }[] }) => <p>mappa con {points.length} punti</p> }))

const me = { id: 'u1', email: 'vale@e.it', displayName: 'Vale', hasAvatar: false, preferredCurrency: 'EUR', chatSound: true, reduceMotion: false }
beforeEach(() => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: 't', user: me }))
  server.use(
    http.get('http://localhost/api/notifications/unread-count', () => HttpResponse.json({ count: 0 })),
    http.get('http://localhost/api/me/stats', () => HttpResponse.json({ trips: 3, destinations: [{ name: 'Lisbona', latitude: 38.7, longitude: -9.1 }, { name: 'Roma', latitude: null, longitude: null }], spending: [{ currency: 'EUR', groupTotal: 1234.5, myShare: 410.25 }, { currency: 'JPY', groupTotal: 30000, myShare: 10000 }], photos: 12 })),
  )
})

it('dati, password e preferenze si salvano; i numeri si vedono', async () => {
  const calls: { url: string; body: unknown }[] = []
  server.use(
    http.patch('http://localhost/api/me', async ({ request }) => { calls.push({ url: 'me', body: await request.json() }); return HttpResponse.json({ ...me, displayName: 'Valentina', email: 'nuova@e.it' }) }),
    http.post('http://localhost/api/me/password', async ({ request }) => { calls.push({ url: 'pw', body: await request.json() }); return new HttpResponse(null, { status: 204 }) }),
    http.patch('http://localhost/api/me/preferences', async ({ request }) => { calls.push({ url: 'prefs', body: await request.json() }); return HttpResponse.json({ ...me, chatSound: false }) }),
  )
  renderWithProviders([{ path: '/profile', element: <ProfilePage /> }], '/profile')
  const user = userEvent.setup()
  await user.clear(await screen.findByLabelText('Nome')); await user.type(screen.getByLabelText('Nome'), 'Valentina')
  await user.clear(screen.getByLabelText('Email')); await user.type(screen.getByLabelText('Email'), 'nuova@e.it')
  await user.click(screen.getByRole('button', { name: 'Salva i dati' }))
  await waitFor(() => expect(calls[0]).toEqual({ url: 'me', body: { displayName: 'Valentina', email: 'nuova@e.it' } }))
  expect(JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY)!).user.displayName).toBe('Valentina')

  await user.type(screen.getByLabelText('Password attuale'), 'password1')
  await user.type(screen.getByLabelText('Nuova password'), 'nuovapass2')
  await user.type(screen.getByLabelText('Conferma la nuova password'), 'diversa99')
  await user.click(screen.getByRole('button', { name: 'Cambia password' }))
  expect(await screen.findByText('Le due password non coincidono')).toBeInTheDocument()
  await user.clear(screen.getByLabelText('Conferma la nuova password')); await user.type(screen.getByLabelText('Conferma la nuova password'), 'nuovapass2')
  await user.click(screen.getByRole('button', { name: 'Cambia password' }))
  await waitFor(() => expect(calls[1]).toEqual({ url: 'pw', body: { currentPassword: 'password1', newPassword: 'nuovapass2' } }))
  expect(await screen.findByText('Password cambiata')).toBeInTheDocument()

  await user.click(screen.getByRole('switch', { name: 'Suono dei messaggi' }))
  await waitFor(() => expect(calls[2]).toEqual({ url: 'prefs', body: { chatSound: false } }))
  expect(JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY)!).user.chatSound).toBe(false)

  expect(screen.getByText('3')).toBeInTheDocument()                 // viaggi
  expect(screen.getByText(/1234,50\s€/)).toBeInTheDocument()       // it-IT separa le migliaia da 5 cifre (format.test.ts)
  expect(screen.getByText(/410,25\s€/)).toBeInTheDocument()
  expect(screen.getByText(/30\.000\sJPY|¥\s?30\.000|30\.000\s¥/)).toBeInTheDocument()   // ogni valuta per conto suo, mai sommate
  expect(screen.getByText('12')).toBeInTheDocument()                // foto
  expect(screen.getByText('Lisbona')).toBeInTheDocument()
  expect(await screen.findByText('mappa con 1 punti')).toBeInTheDocument()  // solo le destinazioni con coordinate; la mappa arriva in differita
  await expectAccessible()   // D-65
})

it('email già usata: errore sul campo', async () => {
  server.use(http.patch('http://localhost/api/me', () => HttpResponse.json({ title: 'Richiesta non valida', detail: 'Email già usata', errors: [{ field: 'email', message: 'Email già usata' }] }, { status: 400 })))
  renderWithProviders([{ path: '/profile', element: <ProfilePage /> }], '/profile')
  const user = userEvent.setup()
  await user.clear(await screen.findByLabelText('Email')); await user.type(screen.getByLabelText('Email'), 'marco@e.it')
  await user.click(screen.getByRole('button', { name: 'Salva i dati' }))
  expect(await screen.findByText('Email già usata')).toBeInTheDocument()
})
