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

it('dice che registrandosi si accettano i termini e porta alle due pagine (D-72)', async () => {
  renderWithProviders([{ path: '/register', element: <RegisterPage /> }], '/register')
  const note = await screen.findByText(/Registrandoti accetti/)
  expect(note).toHaveTextContent('Registrandoti accetti i Termini e condizioni e confermi di aver letto l\'Informativa sulla privacy.')
  expect(screen.getByRole('link', { name: 'Termini e condizioni' })).toHaveAttribute('href', '/termini')
  expect(screen.getByRole('link', { name: 'Informativa sulla privacy' })).toHaveAttribute('href', '/privacy')
})
