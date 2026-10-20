import { render, screen } from '@testing-library/react'
import { encode } from 'uqr'
import { expect, it } from 'vitest'
import { InviteQr } from './InviteQr'

const link = 'https://splittrip.example/join/ROMA-7K2P'

it('disegna esattamente i moduli del link, scuri su bianco, con un nome', async () => {
  render(<InviteQr link={link} label="QR per entrare nel viaggio Roma, codice ROMA-7K2P" />)
  const qr = await screen.findByRole('img', { name: 'QR per entrare nel viaggio Roma, codice ROMA-7K2P' })
  const { data } = encode(link, { ecc: 'M', border: 4 })
  expect(qr.getAttribute('viewBox')).toBe(`0 0 ${data.length} ${data.length}`)
  const d = qr.querySelector('path')!.getAttribute('d')!
  expect(d.match(/h1v1h-1z/g)).toHaveLength(data.flat().filter(Boolean).length)   // un quadrato per modulo scuro
  expect(d).toContain('M4 4h1v1h-1z')   // angolo del primo riquadro di posizione, dopo i 4 moduli di margine
  expect(qr.querySelector('rect')!.getAttribute('fill')).toBe('#ffffff')
})
