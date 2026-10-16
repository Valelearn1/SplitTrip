import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createBrowserRouter, createMemoryRouter, RouterProvider, useLocation } from 'react-router'
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

it('se la prima pagina della scheda è stata sostituita (login, invito, scheda), «Indietro» non esce dall\'app: va alla pagina madre', async () => {
  window.history.replaceState(null, '', '/join/ROMA-7K2P')
  const router = createBrowserRouter(routes)
  render(<RouterProvider router={router} />)
  await router.navigate('/trips/t1/benvenuto', { replace: true })        // come JoinPage dopo l'ingresso
  await userEvent.setup().click(await screen.findByRole('button', { name: 'Indietro' }))
  await waitFor(() => expect(router.state.location.pathname).toBe('/trips/t1'))
})
