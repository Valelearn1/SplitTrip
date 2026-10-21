import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { createMemoryRouter, RouterProvider, type RouteObject } from 'react-router'
import { AuthProvider } from '../features/auth/AuthProvider'

type Entry = string | { pathname: string; state?: unknown }

/** Con un array la cronologia parte da lì e si è sull'ultima voce (per i test di «Indietro»). */
/** `staleTime` come nell'app (10 s) per provare cosa succede ai dati ancora «freschi» in memoria. */
export function renderWithProviders(routes: RouteObject[], initialEntry: Entry | Entry[], options: { staleTime?: number } = {}) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: options.staleTime ?? 0 }, mutations: { retry: false, networkMode: 'always' } } })
  const entries = Array.isArray(initialEntry) ? initialEntry : [initialEntry]
  const router = createMemoryRouter(routes, { initialEntries: entries, initialIndex: entries.length - 1 })
  render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>,
  )
  return router
}
