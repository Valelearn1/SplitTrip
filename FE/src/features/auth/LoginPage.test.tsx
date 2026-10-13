import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '../../test/renderWithProviders'
import { server } from '../../test/server'
import { AUTH_STORAGE_KEY } from './authContext'
import { LoginPage } from './LoginPage'

function renderLogin(from?: string) {
  return renderWithProviders(
    [
      { path: '/login', element: <LoginPage /> },
      { path: '/trips', element: <h1>Viaggi</h1> },
      { path: '/trips/42', element: <h1>Viaggio 42</h1> },
    ],
    { pathname: '/login', state: from ? { from } : undefined },
  )
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
})
