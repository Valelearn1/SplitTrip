import { act, render, screen } from '@testing-library/react'
import { onlineManager } from '@tanstack/react-query'
import { expect, it } from 'vitest'
import { Button } from './Button'

it('offline un bottone che salva si disattiva e dice perché', () => {
  render(<form><Button type="submit">Salva</Button><Button type="button">Annulla</Button></form>)
  act(() => onlineManager.setOnline(false))
  const save = screen.getByRole('button', { name: 'Salva' })
  expect(save).toBeDisabled()
  expect(save).toHaveAttribute('aria-describedby', 'offline-reason')
  expect(save).toHaveAttribute('title', 'Serve la rete per salvare')
  expect(screen.getByRole('button', { name: 'Annulla' })).toBeEnabled()
})

it('needsNetwork={false} lascia attivo anche un submit (accesso); needsNetwork su un bottone normale lo blocca', () => {
  render(<><Button type="submit" needsNetwork={false}>Entra</Button><Button type="button" needsNetwork>Elimina</Button></>)
  act(() => onlineManager.setOnline(false))
  expect(screen.getByRole('button', { name: 'Entra' })).toBeEnabled()
  expect(screen.getByRole('button', { name: 'Elimina' })).toBeDisabled()
})
