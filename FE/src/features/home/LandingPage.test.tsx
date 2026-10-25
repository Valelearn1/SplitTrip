import { screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import { renderWithProviders } from '../../test/renderWithProviders'
import { AUTH_STORAGE_KEY } from '../auth/authContext'
import { LandingPage } from './LandingPage'
import { expectAccessible } from '../../test/a11y'

const routes = [{ path: '/', element: <LandingPage /> }, { path: '/trips', element: <p>Home</p> }]

it('presenta l’app a chi non è loggato', async () => {
  renderWithProviders(routes, '/')
  expect(await screen.findByRole('heading', { name: 'Vacanze in compagnia, conti chiari' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Crea un account' })).toHaveAttribute('href', '/register')
  expect(screen.getByRole('link', { name: 'Accedi' })).toHaveAttribute('href', '/login')
  expect(screen.getByRole('link', { name: 'Ho un codice invito' })).toHaveAttribute('href', '/register?next=/join')   // chi ha un codice è quasi sempre nuovo
  expect(screen.getByText('Prima: pianificate insieme')).toBeInTheDocument()
  expect(screen.getByText('Dividete le spese, non le amicizie.')).toBeInTheDocument()
  expect(screen.getByText(/© 2026 Valentina Ferro/)).toBeInTheDocument()   // D-72
  expect(screen.getByRole('link', { name: 'Termini e condizioni' })).toHaveAttribute('href', '/termini')
  expect(screen.getByRole('link', { name: 'Privacy' })).toHaveAttribute('href', '/privacy')
  await expectAccessible()   // D-65
})

it('chi è loggato va alla Home', async () => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: 't', user: { id: 'u1', email: 'v@e.it', displayName: 'Vale', hasAvatar: false, preferredCurrency: 'EUR', chatSound: true, reduceMotion: false } }))
  renderWithProviders(routes, '/')
  expect(await screen.findByText('Home')).toBeInTheDocument()
})
