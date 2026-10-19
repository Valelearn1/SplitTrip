import { act, render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { expect, it, vi } from 'vitest'
import { AuthProvider } from '../auth/AuthProvider'
import { AUTH_STORAGE_KEY } from '../auth/authContext'
import { DevicePersistence } from './DevicePersistence'

// IndexedDB che non risponde mai (WebKit a volte resta appeso su indexedDB.open)
vi.mock('@tanstack/react-query-persist-client', async (original) => ({
  ...(await original<typeof import('@tanstack/react-query-persist-client')>()),
  persistQueryClientRestore: () => new Promise(() => {}),
  persistQueryClientSubscribe: () => () => {},
}))

it('se il ripristino resta appeso, dopo 1,5 s l\'app si apre lo stesso (niente schermo bianco senza uscita)', async () => {
  vi.useFakeTimers()
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: 't', user: { id: 'u1', email: 'v@e.it', displayName: 'Vale' } }))
    render(<QueryClientProvider client={new QueryClient()}><AuthProvider><DevicePersistence><p>App</p></DevicePersistence></AuthProvider></QueryClientProvider>)
    expect(screen.queryByText('App')).not.toBeInTheDocument()
    await act(() => vi.advanceTimersByTimeAsync(1500))
    expect(screen.getByText('App')).toBeInTheDocument()
  } finally {
    vi.useRealTimers()
  }
})
