import { screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import { renderWithProviders } from '../../test/renderWithProviders'
import { AUTH_STORAGE_KEY } from '../auth/authContext'
import { LandingPage } from './LandingPage'

const routes = [{ path: '/', element: <LandingPage /> }, { path: '/trips', element: <p>Home</p> }]

it('presenta l’app a chi non è loggato', async () => {
  renderWithProviders(routes, '/')
  expect(await screen.findByRole('heading', { name: 'Vacanze tra amici, conti chiari' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Crea un account' })).toHaveAttribute('href', '/register')
  expect(screen.getByRole('link', { name: 'Accedi' })).toHaveAttribute('href', '/login')
  expect(screen.getByRole('link', { name: 'Ho un codice invito' })).toHaveAttribute('href', '/login?next=/join')
  expect(screen.getByText('Prima: pianificate insieme')).toBeInTheDocument()
  expect(screen.getByText('Dividete le spese, non gli amici.')).toBeInTheDocument()
})

it('chi è loggato va alla Home', async () => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: 't', user: { id: 'u1', email: 'v@e.it', displayName: 'Vale', hasAvatar: false, preferredCurrency: 'EUR', chatSound: true, reduceMotion: false } }))
  renderWithProviders(routes, '/')
  expect(await screen.findByText('Home')).toBeInTheDocument()
})
