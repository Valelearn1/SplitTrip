import { type RouteObject } from 'react-router'
import { LoginPage } from '../features/auth/LoginPage'
import { HomePage } from '../features/home/HomePage'
import { LandingPage } from '../features/home/LandingPage'
import { RegisterPage } from '../features/auth/RegisterPage'
import { ForgotPasswordPage } from '../features/auth/ForgotPasswordPage'
import { ResetPasswordPage } from '../features/auth/ResetPasswordPage'
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
import { WelcomePage } from '../features/trips/WelcomePage'
import { NotificationsPage } from '../features/notifications/NotificationsPage'
import { ProfilePage } from '../features/profile/ProfilePage'
import { TodoListsPage } from '../features/todo/TodoListsPage'
import { WrappedPage } from '../features/wrapped/WrappedPage'
import { Layout } from './Layout'
import { NotFoundPage } from './NotFoundPage'
import { RequireAuth } from './RequireAuth'

export const routes: RouteObject[] = [
  {
    element: <Layout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/password-dimenticata', element: <ForgotPasswordPage /> },
      { path: '/reimposta-password', element: <ResetPasswordPage /> },
      {
        element: <RequireAuth />,
        children: [
          { path: '/trips', element: <HomePage /> },
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
              { path: 'benvenuto', element: <WelcomePage /> },
              { path: 'settings', element: <TripSettingsPage /> },
              { path: 'lists', element: <TodoListsPage /> },
              { path: 'riepilogo', element: <WrappedPage /> },
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
