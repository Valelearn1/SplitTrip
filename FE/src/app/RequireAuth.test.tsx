import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'
import { AuthProvider } from '../features/auth/AuthProvider'
import { AUTH_STORAGE_KEY } from '../features/auth/authContext'
import { routes } from './routes'

function renderAt(path: string) {
  const router = createMemoryRouter(
    [...routes, { path: '/login', element: <h1>Login</h1> }],
    { initialEntries: [path] },
  )
  render(
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>,
  )
  return router
}

describe('RequireAuth', () => {
  it('senza login rimanda a /login ricordando la pagina richiesta', async () => {
    const router = renderAt('/trips')
    expect(await screen.findByRole('heading', { name: 'Login' })).toBeInTheDocument()
    expect(router.state.location.state).toEqual({ from: '/trips' })
  })

  it('con login mostra la pagina', async () => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: 't', user: { id: '1', email: 'a@b.it', displayName: 'Vale' } }))
    renderAt('/trips')
    expect(await screen.findByRole('heading', { name: 'I miei viaggi' })).toBeInTheDocument()
  })
})
