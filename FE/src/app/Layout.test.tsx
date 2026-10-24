import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { beforeEach, expect, it } from 'vitest'
import { AUTH_STORAGE_KEY } from '../features/auth/authContext'
import { renderWithProviders } from '../test/renderWithProviders'
import { server } from '../test/server'
import { Layout } from './Layout'

const page = (name: string) => <h2>{name}</h2>
const routes = [{
  element: <Layout />,
  children: [
    { path: '/', element: page('Landing') }, { path: '/login', element: page('Accesso') }, { path: '/register', element: page('Registrazione') },
    { path: '/trips', element: page('Home') }, { path: '/profile', element: page('Profilo') },
    { path: '/trips/:tripId/expenses', element: page('Spese') }, { path: '/trips/:tripId/chat', element: page('Chat') },
    { path: '/termini', element: page('Termini') }, { path: '/privacy', element: page('Privacy') },
  ],
}]

beforeEach(() => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: 't', user: { id: 'u1', email: 'v@e.it', displayName: 'Vale', hasAvatar: false } }))
  server.use(http.get('http://localhost/api/notifications/unread-count', () => HttpResponse.json({ count: 0 })))
})

it.each(['Spese:/trips/t1/expenses', 'Profilo:/profile'])('«Indietro» c\'è in %s', async (entry) => {
  const [name, path] = entry.split(':')
  renderWithProviders(routes, path)
  expect(await screen.findByRole('heading', { name })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Indietro' })).toBeInTheDocument()
})

it.each(['Home:/trips', 'Landing:/', 'Accesso:/login', 'Registrazione:/register', 'Chat:/trips/t1/chat'])('in %s no (la Chat ha il suo nell\'intestazione)', async (entry) => {
  const [name, path] = entry.split(':')
  renderWithProviders(routes, path)
  expect(await screen.findByRole('heading', { name })).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Indietro' })).not.toBeInTheDocument()
})

it('il logo porta alla Home e si chiama «SplitTrip»; il nome ha la sua classe per i telefoni stretti (D-65)', async () => {
  renderWithProviders(routes, '/trips')
  const brand = await screen.findByRole('link', { name: 'SplitTrip' })
  expect(brand).toHaveAttribute('href', '/trips')
  expect(brand.querySelector('.brand-name')).toHaveTextContent('SplitTrip')
})

it.each(['Termini:/termini', 'Privacy:/privacy'])('«Indietro» c\'è in %s anche senza account (D-72)', async (entry) => {
  localStorage.removeItem(AUTH_STORAGE_KEY)
  const [name, path] = entry.split(':')
  renderWithProviders(routes, path)
  expect(await screen.findByRole('heading', { name })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Indietro' })).toBeInTheDocument()
})
