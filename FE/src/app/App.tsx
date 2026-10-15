import { MutationCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LazyMotion, MotionConfig } from 'motion/react'
import { createBrowserRouter, RouterProvider } from 'react-router'
import type { ReactNode } from 'react'
import { AuthProvider } from '../features/auth/AuthProvider'
import { useAuth } from '../features/auth/useAuth'
import { LiveProvider } from '../shared/live/LiveProvider'
import { routes } from './routes'

const queryClient: QueryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 10_000 } },
  // la Home (D-49) riassume tutto: qualsiasi scrittura riuscita la rende vecchia; si ricarica quando si torna lì
  mutationCache: new MutationCache({ onSuccess: () => queryClient.invalidateQueries({ queryKey: ['home'] }) }),
})
const router = createBrowserRouter(routes)
const loadMotionFeatures = () => import('./motionFeatures').then((m) => m.default)

/** D-43 + D-48: animazioni spente se lo chiede il sistema oppure la preferenza dell'account («Riduci le animazioni»). */
function MotionRoot({ children }: { children: ReactNode }) {
  const { auth } = useAuth()
  return <MotionConfig reducedMotion={auth?.user.reduceMotion ? 'always' : 'user'}>{children}</MotionConfig>
}

export function App() {
  return (
    // D-43: con «riduci movimento» attivo le animazioni si azzerano e restano solo gli stati finali
    <LazyMotion features={loadMotionFeatures}>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MotionRoot>
          <LiveProvider>
            <RouterProvider router={router} />
          </LiveProvider>
        </MotionRoot>
      </AuthProvider>
    </QueryClientProvider>
    </LazyMotion>
  )
}
