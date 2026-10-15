import { MutationCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LazyMotion, MotionConfig } from 'motion/react'
import { createBrowserRouter, RouterProvider } from 'react-router'
import { AuthProvider } from '../features/auth/AuthProvider'
import { LiveProvider } from '../shared/live/LiveProvider'
import { routes } from './routes'

const queryClient: QueryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 10_000 } },
  // la Home (D-49) riassume tutto: qualsiasi scrittura riuscita la rende vecchia; si ricarica quando si torna lì
  mutationCache: new MutationCache({ onSuccess: () => queryClient.invalidateQueries({ queryKey: ['home'] }) }),
})
const router = createBrowserRouter(routes)
const loadMotionFeatures = () => import('./motionFeatures').then((m) => m.default)

export function App() {
  return (
    // D-43: con «riduci movimento» attivo le animazioni si azzerano e restano solo gli stati finali
    <LazyMotion features={loadMotionFeatures}>
    <MotionConfig reducedMotion="user">
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LiveProvider>
          <RouterProvider router={router} />
        </LiveProvider>
      </AuthProvider>
    </QueryClientProvider>
    </MotionConfig>
    </LazyMotion>
  )
}
