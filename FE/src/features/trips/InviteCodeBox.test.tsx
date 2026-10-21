import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vitest'
import { expectAccessible } from '../../test/a11y'
import { InviteCodeBox } from './InviteCodeBox'

it('«QR» apre la finestra col QR del link d\'invito e il codice scritto', async () => {
  render(<InviteCodeBox code="ROMA-7K2P" tripName="Roma" />)
  const user = userEvent.setup()
  await user.click(screen.getByRole('button', { name: 'QR' }))
  const dialog = screen.getByRole('dialog', { name: 'Entra nel viaggio' })
  expect(await within(dialog).findByRole('img', { name: 'QR per entrare nel viaggio Roma, codice ROMA-7K2P' })).toBeInTheDocument()
  expect(within(dialog).getByText('ROMA-7K2P')).toBeInTheDocument()
  expect(within(dialog).getByText('Inquadra per entrare in «Roma»')).toBeInTheDocument()
  await expectAccessible()
  await user.click(within(dialog).getByRole('button', { name: 'Chiudi' }))
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})

it('chiudendo con «Chiudi» il focus torna sul bottone «QR» (revisione v3.4)', async () => {
  render(<InviteCodeBox code="ROMA-7K2P" tripName="Roma" />)
  const user = userEvent.setup()
  const qr = screen.getByRole('button', { name: 'QR' })
  await user.click(qr)
  await user.click(within(screen.getByRole('dialog', { name: 'Entra nel viaggio' })).getByRole('button', { name: 'Chiudi' }))
  expect(qr).toHaveFocus()
})
