import { Navigate, type RouteObject } from 'react-router'
import { LoginPage } from '../features/auth/LoginPage'
import { RegisterPage } from '../features/auth/RegisterPage'
import { BalancesPage } from '../features/balances/BalancesPage'
import { SettlementFormPage } from '../features/balances/SettlementFormPage'
import { ExpenseFormPage } from '../features/expenses/ExpenseFormPage'
import { ExpensesPage } from '../features/expenses/ExpensesPage'
import { TrashPage } from '../features/expenses/TrashPage'
import { JoinPage } from '../features/trips/JoinPage'
import { NewTripPage } from '../features/trips/NewTripPage'
import { TripDashboardPage } from '../features/trips/TripDashboardPage'
import { TripLayout } from '../features/trips/TripLayout'
import { TripSettingsPage } from '../features/trips/TripSettingsPage'
import { TripsPage } from '../features/trips/TripsPage'
import { NotificationsPage } from '../features/notifications/NotificationsPage'
import { ProfilePage } from '../features/profile/ProfilePage'
import { TodoListsPage } from '../features/todo/TodoListsPage'
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
          { path: '/notifications', element: <NotificationsPage /> },
          { path: '/profile', element: <ProfilePage /> },
          {
            path: '/trips/:tripId',
            element: <TripLayout />,
            children: [
              { index: true, element: <TripDashboardPage /> },
              { path: 'expenses', element: <ExpensesPage /> },
              { path: 'expenses/new', element: <ExpenseFormPage /> },
              { path: 'expenses/trash', element: <TrashPage /> },
              { path: 'expenses/:expenseId/edit', element: <ExpenseFormPage /> },
              { path: 'balances', element: <BalancesPage /> },
              { path: 'settlements/new', element: <SettlementFormPage /> },
              { path: 'settings', element: <TripSettingsPage /> },
              { path: 'lists', element: <TodoListsPage /> },
              // Leaflet pesa: la pagina Foto si scarica solo quando la si apre
              { path: 'chat', lazy: () => import('../features/chat/ChatPage').then((m) => ({ Component: m.ChatPage })) },
              { path: 'photos', lazy: () => import('../features/photos/PhotosPage').then((m) => ({ Component: m.PhotosPage })) },
            ],
          },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]
