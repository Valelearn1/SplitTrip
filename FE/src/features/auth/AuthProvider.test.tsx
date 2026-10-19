import { expect, test, vi } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { server } from '../../test/server'
import { AuthProvider } from './AuthProvider'
import { AUTH_STORAGE_KEY } from './authContext'
import { useAuth } from './useAuth'

// D-63: l'uscita passa da clearDeviceData (memoria, IndexedDB, immagini); qui basta che venga chiamata e svuoti il client
const { clearDeviceData } = vi.hoisted(() => ({ clearDeviceData: vi.fn(async (client: { clear: () => void }) => client.clear()) }))
vi.mock('../pwa/deviceData', () => ({ clearDeviceData }))

function LogoutButton() {
  const { logout } = useAuth()
  return <button onClick={logout}>Esci</button>
}

test('il logout svuota la cache: chi entra dopo sullo stesso telefono non vede i viaggi di prima', async () => {
  const queryClient = new QueryClient()
  queryClient.setQueryData(['trips'], [{ id: 't1', name: 'Roma' }])
  render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LogoutButton />
      </AuthProvider>
    </QueryClientProvider>,
  )

  await userEvent.click(screen.getByRole('button', { name: 'Esci' }))

  expect(queryClient.getQueryData(['trips'])).toBeUndefined()
  expect(clearDeviceData).toHaveBeenCalledTimes(1)
})

function SoundState() {
  const { auth } = useAuth()
  return <p>suono: {String(auth?.user.chatSound)}</p>
}

test('all’avvio l’account si rilegge dal server: una preferenza cambiata su un altro dispositivo vale anche qui (D-48)', async () => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: 't', user: { id: 'u1', email: 'v@e.it', displayName: 'Vale', hasAvatar: false, preferredCurrency: 'EUR', chatSound: true, reduceMotion: false } }))
  server.use(http.get('http://localhost/api/me', () => HttpResponse.json({ id: 'u1', email: 'v@e.it', displayName: 'Vale', hasAvatar: false, preferredCurrency: 'EUR', chatSound: false, reduceMotion: false })))
  render(<QueryClientProvider client={new QueryClient()}><AuthProvider><SoundState /></AuthProvider></QueryClientProvider>)
  expect(await screen.findByText('suono: false')).toBeInTheDocument()
  expect(JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY)!).user.chatSound).toBe(false)
})
