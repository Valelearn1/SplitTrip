import { Navigate, type RouteObject } from 'react-router'
import { Layout } from './Layout'
import { NotFoundPage } from './NotFoundPage'
import { RequireAuth } from './RequireAuth'

export const routes: RouteObject[] = [
  {
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="/trips" replace /> },
      {
        element: <RequireAuth />,
        // Segnaposto: sostituito dalla pagina vera nel task FE-03
        children: [{ path: '/trips', element: <h1>I miei viaggi</h1> }],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]
