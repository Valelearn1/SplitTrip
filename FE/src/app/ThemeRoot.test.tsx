import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { AuthProvider } from '../features/auth/AuthProvider'
import { AUTH_STORAGE_KEY } from '../features/auth/authContext'
import { server } from '../test/server'
import { ThemeRoot } from './ThemeRoot'
import { ThemeToggle } from './ThemeToggle'

const base = { id: 'u1', email: 'v@e.it', displayName: 'Vale', hasAvatar: false, preferredCurrency: 'EUR', chatSound: true, reduceMotion: false }
const session = (user: object) => localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: 't', user }))
function mount() {
  return render(<QueryClientProvider client={new QueryClient()}><AuthProvider><ThemeRoot><ThemeToggle /></ThemeRoot></AuthProvider></QueryClientProvider>)
}
let systemDark = false
beforeEach(() => {
  document.head.insertAdjacentHTML('beforeend', '<meta name="theme-color" content="#00685c">')
  vi.spyOn(window, 'matchMedia').mockImplementation((q) => ({ matches: q.includes('dark') && systemDark, media: q, addEventListener: () => {}, removeEventListener: () => {}, onchange: null, addListener: () => {}, removeListener: () => {}, dispatchEvent: () => false }))
  server.use(http.get('http://localhost/api/me', () => HttpResponse.json({ ...base, theme: 'SYSTEM' })))
})
afterEach(() => { delete document.documentElement.dataset.theme; document.querySelector('meta[name="theme-color"]')?.remove(); systemDark = false })

it('DARK sull’account → tema scuro e colore della barra del browser', () => {
  session({ ...base, theme: 'DARK' })
  mount()
  expect(document.documentElement.dataset.theme).toBe('dark')
  expect(document.querySelector('meta[name="theme-color"]')).toHaveAttribute('content', '#0f1620')
})

it('SYSTEM segue il sistema; una sessione salvata prima della v3.2 (senza tema) vale SYSTEM', () => {   // Review Focus 3
  systemDark = true
  session(base)
  mount()
  expect(document.documentElement.dataset.theme).toBe('dark')
})

it('luna/sole passa tra chiaro e scuro e salva sull’account', async () => {
  let sent: unknown
  server.use(http.patch('http://localhost/api/me/preferences', async ({ request }) => { sent = await request.json(); return HttpResponse.json({ ...base, theme: 'DARK' }) }))
  session({ ...base, theme: 'LIGHT' })
  mount()
  const toggle = screen.getByRole('button', { name: 'Attiva il tema scuro' })
  await userEvent.setup().click(toggle)
  expect(document.documentElement.dataset.theme).toBe('dark')
  expect(sent).toEqual({ theme: 'DARK' })
  expect(screen.getByRole('button', { name: 'Attiva il tema chiaro' })).toBeInTheDocument()
})
