import { render, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { InviteQr } from './InviteQr'

vi.mock('uqr', () => { throw new Error('offline: il file non è mai stato scaricato') })

it('se il QR non si carica resta il codice scritto, senza errori', async () => {
  render(<InviteQr link="https://x/join/ROMA-7K2P" label="QR" />)
  expect(await screen.findByText('Usa il codice qui sotto')).toBeInTheDocument()
  expect(screen.queryByRole('img')).not.toBeInTheDocument()
})
