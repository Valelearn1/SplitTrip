import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vitest'
import { PasswordField } from './PasswordField'

it('l\'occhiolino mostra e nasconde la password, con nome e stato per i lettori di schermo', async () => {
  render(<PasswordField label="Password" defaultValue="segreta1" />)
  const input = screen.getByLabelText('Password')
  expect(input).toHaveAttribute('type', 'password')
  const eye = screen.getByRole('button', { name: 'Mostra password' })
  expect(eye).toHaveAttribute('aria-pressed', 'false')
  expect(eye).toHaveAttribute('aria-controls', input.id)
  await userEvent.setup().click(eye)
  expect(input).toHaveAttribute('type', 'text')
  expect(screen.getByRole('button', { name: 'Nascondi password' })).toHaveAttribute('aria-pressed', 'true')
})
