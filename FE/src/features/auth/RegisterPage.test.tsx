import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { expect, it } from 'vitest'
import { expectAccessible } from '../../test/a11y'
import { renderWithProviders } from '../../test/renderWithProviders'
import { server } from '../../test/server'
import { RegisterPage } from './RegisterPage'

it('la registrazione è accessibile', async () => {
  renderWithProviders([{ path: '/register', element: <RegisterPage /> }], '/register')
  expect(await screen.findByRole('heading', { name: 'Crea il tuo account' })).toBeInTheDocument()
  await expectAccessible()
})

const fill = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(await screen.findByLabelText('Nome'), 'Ada')
  await user.type(screen.getByLabelText('Email'), 'ada@e.it')
  await user.type(screen.getByLabelText('Password'), 'password1')
}

it('la casella dei termini porta alle due pagine (D-72, D-73)', async () => {
  renderWithProviders([{ path: '/register', element: <RegisterPage /> }], '/register')
  const box = await screen.findByRole('checkbox', { name: 'Accetto i Termini e condizioni e ho letto l\'Informativa sulla privacy' })
  expect(box).not.toBeChecked()
  expect(screen.getByRole('link', { name: 'Termini e condizioni' })).toHaveAttribute('href', '/termini')
  expect(screen.getByRole('link', { name: 'Informativa sulla privacy' })).toHaveAttribute('href', '/privacy')
})

it('senza la spunta non parte niente e il messaggio è legato alla casella (D-73)', async () => {
  let calls = 0
  server.use(http.post('http://localhost/api/auth/register', () => { calls++; return HttpResponse.json({}, { status: 201 }) }))
  const user = userEvent.setup()
  renderWithProviders([{ path: '/register', element: <RegisterPage /> }], '/register')
  await fill(user)
  await user.click(screen.getByRole('button', { name: 'Registrati' }))
  const box = screen.getByRole('checkbox', { name: /Accetto i Termini/ })
  expect(await screen.findByText('Per registrarti accetta i Termini e condizioni')).toBeInTheDocument()
  expect(box).toHaveAttribute('aria-invalid', 'true')
  expect(box).toHaveAccessibleDescription('Per registrarti accetta i Termini e condizioni')
  expect(calls).toBe(0)
})

it('con la spunta la registrazione manda acceptedTerms: true (D-73)', async () => {
  let body: unknown
  server.use(http.post('http://localhost/api/auth/register', async ({ request }) => {
    body = await request.json()
    return HttpResponse.json({ token: 't', user: { id: 'u1', email: 'ada@e.it', displayName: 'Ada', hasAvatar: false, preferredCurrency: 'EUR', chatSound: true, reduceMotion: false } }, { status: 201 })
  }))
  const user = userEvent.setup()
  renderWithProviders([{ path: '/register', element: <RegisterPage /> }, { path: '/trips', element: <p>Home</p> }], '/register')
  await fill(user)
  await user.click(screen.getByRole('checkbox', { name: /Accetto i Termini/ }))
  await user.click(screen.getByRole('button', { name: 'Registrati' }))
  expect(await screen.findByText('Home')).toBeInTheDocument()
  expect(body).toEqual({ displayName: 'Ada', email: 'ada@e.it', password: 'password1', acceptedTerms: true })
})

it('nessun placeholder nei campi; le regole della password stanno sotto il campo e il lettore di schermo le legge', async () => {
  renderWithProviders([{ path: '/register', element: <RegisterPage /> }], '/register')
  for (const label of ['Nome', 'Email', 'Password']) expect(await screen.findByLabelText(label)).not.toHaveAttribute('placeholder')
  expect(screen.getByLabelText('Password')).toHaveAccessibleDescription('Almeno 8 caratteri, con una lettera e una cifra')
})

it('con ?next=/join spiega che serve un account e dopo la registrazione porta al codice', async () => {
  server.use(http.post('http://localhost/api/auth/register', () =>
    HttpResponse.json({ token: 't', user: { id: 'u1', email: 'ada@e.it', displayName: 'Ada', hasAvatar: false, preferredCurrency: 'EUR', chatSound: true, reduceMotion: false } }, { status: 201 })))
  const user = userEvent.setup()
  renderWithProviders([{ path: '/register', element: <RegisterPage /> }, { path: '/join', element: <h1>Inserisci il codice</h1> }], '/register?next=/join')
  expect(await screen.findByText(/Per entrare nel viaggio con un codice serve un account/)).toBeInTheDocument()
  expect(screen.getByText(/chi organizza lo aggiunge per nome/)).toBeInTheDocument()
  await fill(user)
  await user.click(screen.getByRole('checkbox', { name: /Accetto i Termini/ }))
  await user.click(screen.getByRole('button', { name: 'Registrati' }))
  expect(await screen.findByRole('heading', { name: 'Inserisci il codice' })).toBeInTheDocument()
})

it('?next= verso un altro sito viene ignorato anche qui', async () => {
  renderWithProviders([{ path: '/register', element: <RegisterPage /> }], '/register?next=//esempio.test/trappola')
  await screen.findByRole('heading', { name: 'Crea il tuo account' })
  expect(screen.queryByText(/serve un account/)).not.toBeInTheDocument()
})
