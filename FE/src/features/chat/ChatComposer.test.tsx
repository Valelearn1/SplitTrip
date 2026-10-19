import { render, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { ChatComposer } from './ChatComposer'

it('offline il campo è disattivato e dice quando tornano i messaggi', () => {
  render(<ChatComposer onSend={vi.fn()} onTyping={vi.fn()} sending={false} offline />)
  const box = screen.getByLabelText('Scrivi un messaggio')
  expect(box).toBeDisabled()
  expect(box).toHaveAttribute('placeholder', 'Sei offline: i messaggi tornano con la rete')
})
