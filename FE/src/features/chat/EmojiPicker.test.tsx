import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { ChatComposer } from './ChatComposer'

it('la griglia inserisce l’emoji dove c’è il cursore e si chiude con Esc', async () => {
  render(<ChatComposer onSend={vi.fn(async () => {})} onTyping={() => {}} sending={false} />)
  const user = userEvent.setup()
  const input = screen.getByRole('textbox', { name: 'Scrivi un messaggio' })
  await user.type(input, 'Ci vediamo')
  await user.click(screen.getByRole('button', { name: 'Emoji' }))
  expect(screen.getByRole('dialog', { name: 'Scegli un’emoji' })).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'pizza' }))
  expect(input).toHaveValue('Ci vediamo🍕')
  expect(input).toHaveFocus()
  await user.click(screen.getByRole('button', { name: 'Emoji' }))
  await user.keyboard('{Escape}')
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})
