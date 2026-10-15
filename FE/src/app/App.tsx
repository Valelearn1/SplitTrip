import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createBrowserRouter, RouterProvider } from 'react-router'
import { AuthProvider } from '../features/auth/AuthProvider'
import { LiveProvider } from '../shared/live/LiveProvider'
import { routes } from './routes'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 10_000 } },
})
const router = createBrowserRouter(routes)

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LiveProvider>
          <RouterProvider router={router} />
        </LiveProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
