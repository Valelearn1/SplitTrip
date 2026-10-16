import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider, useLocation } from 'react-router'
import { expect, it } from 'vitest'
import { BackButton } from './BackButton'

function Page() {
  return <><p>{useLocation().pathname}</p><BackButton /></>
}
const routes = [{ path: '*', element: <Page /> }]

it('con una pagina precedente nell\'app torna lì', async () => {
  const router = createMemoryRouter(routes, { initialEntries: ['/profile', '/trips/t1/expenses/new'], initialIndex: 1 })
  render(<RouterProvider router={router} />)
  await userEvent.setup().click(screen.getByRole('button', { name: 'Indietro' }))
  expect(router.state.location.pathname).toBe('/profile')
})

it('aperta da un link diretto va alla pagina madre', async () => {
  const router = createMemoryRouter(routes, { initialEntries: ['/trips/t1/expenses/new'] })
  render(<RouterProvider router={router} />)
  await userEvent.setup().click(screen.getByRole('button', { name: 'Indietro' }))
  expect(router.state.location.pathname).toBe('/trips/t1/expenses')
})
