import { Navigate, type RouteObject } from 'react-router'
import { LoginPage } from '../features/auth/LoginPage'
import { RegisterPage } from '../features/auth/RegisterPage'
import { JoinPage } from '../features/trips/JoinPage'
import { NewTripPage } from '../features/trips/NewTripPage'
import { TripDashboardPage } from '../features/trips/TripDashboardPage'
import { TripLayout } from '../features/trips/TripLayout'
import { TripSettingsPage } from '../features/trips/TripSettingsPage'
import { TripsPage } from '../features/trips/TripsPage'
import { Layout } from './Layout'
import { NotFoundPage } from './NotFoundPage'
import { RequireAuth } from './RequireAuth'

export const routes: RouteObject[] = [
  {
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="/trips" replace /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      {
        element: <RequireAuth />,
        children: [
          { path: '/trips', element: <TripsPage /> },
          { path: '/trips/new', element: <NewTripPage /> },
          { path: '/join', element: <JoinPage /> },
          { path: '/join/:code', element: <JoinPage /> },
          {
            path: '/trips/:tripId',
            element: <TripLayout />,
            children: [
              { index: true, element: <TripDashboardPage /> },
              { path: 'settings', element: <TripSettingsPage /> },
            ],
          },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]
