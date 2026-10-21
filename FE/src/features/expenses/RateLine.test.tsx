import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { useState, type ReactElement } from 'react'
import { expect, it, vi } from 'vitest'
import { renderWithProviders } from '../../test/renderWithProviders'
import { server } from '../../test/server'
import { AUTH_STORAGE_KEY } from '../auth/authContext'
import { expectAccessible } from '../../test/a11y'
import { RateLine } from './RateLine'
import { fromFxRate, toFxRate } from './useRate'

function Harness({ from, onChange }: { from: string; onChange?: (v: string) => void }) {
  const [value, setValue] = useState('')
  return <RateLine from={from} to="EUR" date="2026-10-18" value={value} onChange={(v) => { setValue(v); onChange?.(v) }} />
}

const page = (el: ReactElement) => renderWithProviders([{ path: '/', element: el }], '/')

it('propone il cambio BCE del giorno come «1 € = 177,82 JPY», con la data del tasso', async () => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: 't', user: { id: 'u1', email: 'v@e.it', displayName: 'Vale' } }))
  server.use(http.get('http://localhost/api/rates', ({ request }) => {
    const u = new URL(request.url)
    expect([u.searchParams.get('from'), u.searchParams.get('to'), u.searchParams.get('date')]).toEqual(['JPY', 'EUR', '2026-10-18'])
    return HttpResponse.json({ rate: 0.00562366, date: '2026-10-16' })
  }))
  const onChange = vi.fn()
  page(<Harness from="JPY" onChange={onChange} />)
  expect(await screen.findByText('Cambio del 16 ott (BCE): 1 € = 177,82 JPY')).toBeInTheDocument()
  expect(onChange).toHaveBeenCalledWith('177,82')
  await expectAccessible()
})

it('«Modifica» apre il campo «1 € = … JPY»; senza cambio (404) il campo è obbligatorio e lo dice', async () => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: 't', user: { id: 'u1', email: 'v@e.it', displayName: 'Vale' } }))
  server.use(http.get('http://localhost/api/rates', () => HttpResponse.json({ title: 'x', detail: 'Cambio non disponibile per MAD: scrivilo a mano' }, { status: 404 })))
  page(<Harness from="MAD" />)
  const input = await screen.findByLabelText('1 € = … MAD')
  expect(screen.getByText('Cambio non disponibile per MAD: scrivilo a mano')).toBeInTheDocument()
  await userEvent.setup().type(input, '10,8')
  expect(input).toHaveValue('10,8')
})

it('con il servizio giù (503) chiede il cambio a mano senza bloccare', async () => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: 't', user: { id: 'u1', email: 'v@e.it', displayName: 'Vale' } }))
  server.use(http.get('http://localhost/api/rates', () => HttpResponse.json({ title: 'x', detail: 'Servizio dei cambi non disponibile: scrivi il cambio a mano' }, { status: 503 })))
  page(<Harness from="JPY" />)
  expect(await screen.findByText('Servizio dei cambi non disponibile: scrivi il cambio a mano')).toBeInTheDocument()
  expect(screen.getByLabelText('1 € = … JPY')).toBeInTheDocument()
})

it('il cambio inviato al server è l\'inverso, a 8 decimali', () => {
  expect(toFxRate('177,82')).toBe(0.00562366)
  expect(fromFxRate(0.00562366)).toBe('177,82')
  expect(toFxRate('0')).toBe(0)
})
