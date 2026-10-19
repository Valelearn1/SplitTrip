import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { onlineManager } from '@tanstack/react-query'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '../../test/renderWithProviders'
import { server } from '../../test/server'
import { AUTH_STORAGE_KEY } from './authContext'
import { LoginPage } from './LoginPage'

const loginRoutes = [
  { path: '/login', element: <LoginPage /> },
  { path: '/trips', element: <h1>Viaggi</h1> },
  { path: '/trips/42', element: <h1>Viaggio 42</h1> },
  { path: '/join', element: <h1>Inserisci il codice</h1> },
]

function renderLogin(from?: string) {
  return renderWithProviders(loginRoutes, { pathname: '/login', state: from ? { from } : undefined })
}

async function loginAs() {
  server.use(http.post('http://localhost/api/auth/login', () => HttpResponse.json({ token: 'tok', user: { id: '1', email: 'vale@example.com', displayName: 'Vale' } })))
  const user = userEvent.setup()
  await user.type(screen.getByLabelText('Email'), 'vale@example.com')
  await user.type(screen.getByLabelText('Password'), 'password1')
  await user.click(screen.getByRole('button', { name: 'Entra' }))
}

describe('LoginPage', () => {
  it('fa il login, salva il token e torna alla pagina richiesta', async () => {
    server.use(
      http.post('http://localhost/api/auth/login', async ({ request }) => {
        const body = (await request.json()) as { email: string; password: string }
        expect(body).toEqual({ email: 'vale@example.com', password: 'password1' })
        return HttpResponse.json({ token: 'tok', user: { id: '1', email: 'vale@example.com', displayName: 'Vale' } })
      }),
    )
    renderLogin('/trips/42')
    const user = userEvent.setup()
    await user.type(screen.getByLabelText('Email'), 'vale@example.com')
    await user.type(screen.getByLabelText('Password'), 'password1')
    await user.click(screen.getByRole('button', { name: 'Entra' }))

    expect(await screen.findByRole('heading', { name: 'Viaggio 42' })).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY)!).token).toBe('tok')
  })

  it('?next= dalla pagina di presentazione porta dove serve (es. «Ho un codice invito»)', async () => {
    renderWithProviders(loginRoutes, '/login?next=/join')
    await loginAs()
    expect(await screen.findByRole('heading', { name: 'Inserisci il codice' })).toBeInTheDocument()
  })

  it('?next= verso un altro sito viene ignorato', async () => {
    renderWithProviders(loginRoutes, '/login?next=//esempio.test/trappola')
    await loginAs()
    expect(await screen.findByRole('heading', { name: 'Viaggi' })).toBeInTheDocument()
  })

  it('mostra il messaggio del server su credenziali sbagliate', async () => {
    server.use(
      http.post('http://localhost/api/auth/login', () =>
        HttpResponse.json({ status: 401, title: 'Non autenticato', detail: 'Credenziali non valide' }, { status: 401 }),
      ),
    )
    renderLogin()
    const user = userEvent.setup()
    await user.type(screen.getByLabelText('Email'), 'vale@example.com')
    await user.type(screen.getByLabelText('Password'), 'sbagliata')
    await user.click(screen.getByRole('button', { name: 'Entra' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Credenziali non valide')
  })

  it('offline il bottone resta attivo e all\'invio dice che serve la rete per entrare', async () => {
    server.use(http.post('http://localhost/api/auth/login', () => HttpResponse.error()))
    renderLogin()
    const user = userEvent.setup()
    onlineManager.setOnline(false)
    await user.type(screen.getByLabelText('Email'), 'vale@example.com')
    await user.type(screen.getByLabelText('Password'), 'password1')
    await user.click(screen.getByRole('button', { name: 'Entra' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Serve la rete per entrare')
  })
})
