import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AUTH_STORAGE_KEY } from '../features/auth/authContext'
import { renderWithProviders } from '../test/renderWithProviders'
import { routes } from './routes'

describe('RequireAuth', () => {
  it('senza login rimanda a /login ricordando la pagina richiesta', async () => {
    const router = renderWithProviders(routes, '/trips')
    expect(await screen.findByRole('heading', { name: 'Bentornata su SplitTrip' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/login')
    expect(router.state.location.state).toEqual({ from: '/trips' })
  })

  it('con login mostra la pagina', async () => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: 't', user: { id: '1', email: 'a@b.it', displayName: 'Vale' } }))
    renderWithProviders(routes, '/trips')
    expect(await screen.findByRole('heading', { name: 'I miei viaggi' })).toBeInTheDocument()
  })
})
