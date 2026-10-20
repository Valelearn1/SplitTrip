import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { expect, it } from 'vitest'
import { renderWithProviders } from '../../test/renderWithProviders'
import { server } from '../../test/server'
import { ForgotPasswordPage } from './ForgotPasswordPage'
import { LoginPage } from './LoginPage'
import { ResetPasswordPage } from './ResetPasswordPage'
import { expectAccessible } from '../../test/a11y'

const routes = [
  { path: '/login', element: <LoginPage /> },
  { path: '/password-dimenticata', element: <ForgotPasswordPage /> },
  { path: '/reimposta-password', element: <ResetPasswordPage /> },
]
const SENT = "Se l'indirizzo è registrato ti abbiamo scritto: controlla anche lo spam."

it('dall\'accesso a «Password dimenticata?»: il messaggio è lo stesso per qualsiasi email', async () => {
  let sent: unknown
  server.use(http.post('http://localhost/api/auth/password-reset/request', async ({ request }) => {
    sent = await request.json()
    return new HttpResponse(null, { status: 204 })
  }))
  renderWithProviders(routes, '/login')
  const user = userEvent.setup()
  await user.click(screen.getByRole('link', { name: 'Password dimenticata?' }))
  await user.type(await screen.findByLabelText('Email'), 'vale@example.com')
  await user.click(screen.getByRole('button', { name: 'Mandami il link' }))
  expect(await screen.findByText(SENT)).toBeInTheDocument()
  expect(sent).toEqual({ email: 'vale@example.com' })
  expect(screen.getByRole('link', { name: "Torna all'accesso" })).toHaveAttribute('href', '/login')
  await expectAccessible()   // D-65
})

it('nuova password: le due devono coincidere, poi «Password cambiata» e «Accedi»', async () => {
  let sent: unknown
  server.use(http.post('http://localhost/api/auth/password-reset/confirm', async ({ request }) => {
    sent = await request.json()
    return new HttpResponse(null, { status: 204 })
  }))
  renderWithProviders(routes, '/reimposta-password?token=abc')
  const user = userEvent.setup()
  await user.type(screen.getByLabelText('Nuova password'), 'nuova1234')
  await user.type(screen.getByLabelText('Conferma la nuova password'), 'nuova9999')
  await user.click(screen.getByRole('button', { name: 'Cambia password' }))
  expect(await screen.findByText('Le due password non coincidono')).toBeInTheDocument()
  expect(sent).toBeUndefined()
  await user.clear(screen.getByLabelText('Conferma la nuova password'))
  await user.type(screen.getByLabelText('Conferma la nuova password'), 'nuova1234')
  await user.click(screen.getByRole('button', { name: 'Cambia password' }))
  expect(await screen.findByText('Password cambiata')).toBeInTheDocument()
  expect(sent).toEqual({ token: 'abc', newPassword: 'nuova1234' })
  expect(screen.getByRole('link', { name: 'Accedi' })).toHaveAttribute('href', '/login')
  await expectAccessible()   // D-65
})

it('link scaduto o già usato: il messaggio del server e «Chiedi un nuovo link»', async () => {
  server.use(http.post('http://localhost/api/auth/password-reset/confirm', () =>
    HttpResponse.json({ status: 400, title: 'Richiesta non valida', detail: 'Link non valido o scaduto' }, { status: 400 })))
  renderWithProviders(routes, '/reimposta-password?token=vecchio')
  const user = userEvent.setup()
  await user.type(screen.getByLabelText('Nuova password'), 'nuova1234')
  await user.type(screen.getByLabelText('Conferma la nuova password'), 'nuova1234')
  await user.click(screen.getByRole('button', { name: 'Cambia password' }))
  expect(await screen.findByText('Link non valido o scaduto')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Chiedi un nuovo link' })).toHaveAttribute('href', '/password-dimenticata')
})

it('senza token nell\'indirizzo non si prova nemmeno: link non valido', async () => {
  let called = false
  server.use(http.post('http://localhost/api/auth/password-reset/confirm', () => { called = true; return new HttpResponse(null, { status: 204 }) }))
  renderWithProviders(routes, '/reimposta-password')
  expect(await screen.findByText('Link non valido o scaduto')).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Cambia password' })).not.toBeInTheDocument()
  await waitFor(() => expect(called).toBe(false))
})

it('il token lascia la barra degli indirizzi ma il link funziona lo stesso', async () => {
  let sent: unknown
  server.use(http.post('http://localhost/api/auth/password-reset/confirm', async ({ request }) => {
    sent = await request.json()
    return new HttpResponse(null, { status: 204 })
  }))
  const router = renderWithProviders(routes, '/reimposta-password?token=abc')
  await waitFor(() => expect(router.state.location.search).toBe(''))   // tolto dall'indirizzo (e dalla cronologia)
  expect(router.state.location.pathname).toBe('/reimposta-password')
  const user = userEvent.setup()
  await user.type(screen.getByLabelText('Nuova password'), 'nuova1234')
  await user.type(screen.getByLabelText('Conferma la nuova password'), 'nuova1234')
  await user.click(screen.getByRole('button', { name: 'Cambia password' }))
  expect(await screen.findByText('Password cambiata')).toBeInTheDocument()
  expect(sent).toEqual({ token: 'abc', newPassword: 'nuova1234' })   // il token è rimasto in memoria
})
