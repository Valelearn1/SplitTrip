import { screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import { expectAccessible } from '../../test/a11y'
import { renderWithProviders } from '../../test/renderWithProviders'
import { RegisterPage } from './RegisterPage'

it('la registrazione è accessibile', async () => {
  renderWithProviders([{ path: '/register', element: <RegisterPage /> }], '/register')
  expect(await screen.findByRole('heading', { name: 'Crea il tuo account' })).toBeInTheDocument()
  await expectAccessible()
})
