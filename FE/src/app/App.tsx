import { MutationCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LazyMotion } from 'motion/react'
import { createBrowserRouter, RouterProvider } from 'react-router'
import { AuthProvider } from '../features/auth/AuthProvider'
import { DevicePersistence } from '../features/pwa/DevicePersistence'
import { networkNotice } from '../features/pwa/networkNotice'
import { isOfflineError } from '../shared/api/client'
import { LiveProvider } from '../shared/live/LiveProvider'
import { MotionRoot } from './MotionRoot'
import { ThemeRoot } from './ThemeRoot'
import { routes } from './routes'

const queryClient: QueryClient = new QueryClient({
  // gcTime lungo: le query devono restare in memoria per essere salvate sul telefono (D-63)
  defaultOptions: {
    queries: { retry: 1, staleTime: 10_000, gcTime: 7 * 24 * 60 * 60 * 1000 },
    // D-63: offline una modifica fallisce subito, mai in coda (niente spese doppie al ritorno della rete)
    mutations: { networkMode: 'always' },
  },
  // la Home (D-49) riassume tutto: qualsiasi scrittura riuscita la rende vecchia; si ricarica quando si torna lì
  mutationCache: new MutationCache({
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['home'] }),
    onError: (error) => { if (isOfflineError(error)) networkNotice.notify() },
  }),
})
const router = createBrowserRouter(routes)
const loadMotionFeatures = () => import('./motionFeatures').then((m) => m.default)

export function App() {
  return (
    // D-43: con «riduci movimento» attivo le animazioni si azzerano e restano solo gli stati finali
    <LazyMotion features={loadMotionFeatures}>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <DevicePersistence>
        <ThemeRoot>
          <MotionRoot>
            <LiveProvider>
              <RouterProvider router={router} />
            </LiveProvider>
          </MotionRoot>
        </ThemeRoot>
        </DevicePersistence>
      </AuthProvider>
    </QueryClientProvider>
    </LazyMotion>
  )
}
