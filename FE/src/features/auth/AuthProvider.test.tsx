import { expect, test } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider } from './AuthProvider'
import { useAuth } from './useAuth'

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
})
