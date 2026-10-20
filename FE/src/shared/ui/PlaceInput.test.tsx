import { useState } from 'react'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { expect, it, vi } from 'vitest'
import { server } from '../../test/server'
import { placesApi } from '../api/placesApi'
import { PlaceInput, type PlaceValue } from './PlaceInput'

const lisbona = { name: 'Lisbona', detail: 'Portogallo', latitude: 38.7169, longitude: -9.1399 }
const belem = { name: 'Belém', detail: 'Lisbona, Portogallo', latitude: 38.6967, longitude: -9.2065 }

function Harness({ onChange, near }: { onChange: (v: PlaceValue) => void; near?: { latitude: number; longitude: number } }) {
  const [v, setV] = useState<PlaceValue>({ name: '' }) // il campo è controllato: lo stato sta in chi lo usa
  return <PlaceInput id="dest" label="Destinazione" value={v} onChange={(x) => { setV(x); onChange(x) }} near={near} />
}

it('propone luoghi dalla terza lettera e la scelta tiene le coordinate', async () => {
  const queries: string[] = []
  server.use(http.get('http://localhost/api/places', ({ request }) => {
    const u = new URL(request.url); queries.push(u.searchParams.get('q')!)
    return HttpResponse.json([lisbona, belem])
  }))
  const onChange = vi.fn()
  render(<Harness onChange={onChange} />)
  const user = userEvent.setup()
  const input = screen.getByRole('combobox', { name: 'Destinazione' })
  await user.type(input, 'li')
  await new Promise((r) => setTimeout(r, 400))
  expect(queries).toEqual([])                                  // sotto i 3 caratteri non si cerca
  await user.type(input, 's')
  await waitFor(() => expect(queries).toEqual(['lis']))
  expect(await screen.findByRole('option', { name: /^Lisbona/ })).toBeInTheDocument()
  expect(screen.getByText('2 proposte')).toBeInTheDocument()
  await user.keyboard('{ArrowDown}{ArrowDown}{Enter}')          // seconda proposta
  expect(onChange).toHaveBeenLastCalledWith({ name: 'Belém', latitude: 38.6967, longitude: -9.2065 })
  expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
})

it('scrivere ancora dopo una scelta azzera le coordinate; Esc chiude; near arriva al server', async () => {
  const nears: (string | null)[] = []
  server.use(http.get('http://localhost/api/places', ({ request }) => { nears.push(new URL(request.url).searchParams.get('near')); return HttpResponse.json([lisbona]) }))
  const onChange = vi.fn()
  function Controlled() {
    const [v, setV] = useStateMock()
    return <PlaceInput id="p" label="Luogo" value={v} onChange={(x) => { setV(x); onChange(x) }} near={{ latitude: 38.72, longitude: -9.14 }} />
  }
  render(<Controlled />)
  const user = userEvent.setup()
  const input = screen.getByRole('combobox', { name: 'Luogo' })
  await user.type(input, 'lisb')
  await user.click(await screen.findByRole('option', { name: /Lisbona/ }))
  expect(onChange).toHaveBeenLastCalledWith({ name: 'Lisbona', latitude: 38.7169, longitude: -9.1399 })
  await user.type(input, 'x')
  expect(onChange).toHaveBeenLastCalledWith({ name: 'Lisbonax' })  // testo libero: niente coordinate
  await user.keyboard('{Escape}')
  expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  expect(nears[0]).toBe('38.72,-9.14')
})

// piccolo stato controllato per il secondo test
function useStateMock(): [PlaceValue, (v: PlaceValue) => void] { return useState<PlaceValue>({ name: '' }) }

it('la ricerca parte 150 ms dopo l\'ultima lettera e intanto dice «Cerco luoghi…»', async () => {
  vi.useFakeTimers()
  try {
    const queries: string[] = []
    let release!: () => void
    const answered = new Promise<void>((r) => { release = r })
    server.use(http.get('http://localhost/api/places', async ({ request }) => {
      queries.push(new URL(request.url).searchParams.get('q')!)
      await answered
      return HttpResponse.json([lisbona])
    }))
    render(<Harness onChange={() => {}} />)
    fireEvent.change(screen.getByRole('combobox', { name: 'Destinazione' }), { target: { value: 'Lis' } })
    expect(screen.getByText('Cerco luoghi…')).toBeInTheDocument()       // subito: chi scrive vede che qualcosa succede
    const search = vi.spyOn(placesApi, 'search')
    await act(() => vi.advanceTimersByTimeAsync(149))
    expect(search).not.toHaveBeenCalled()
    await act(() => vi.advanceTimersByTimeAsync(1))
    expect(search).toHaveBeenCalledWith('Lis', undefined)                // a 150 ms, non a 300
    await vi.waitFor(() => expect(queries).toEqual(['Lis']))
    release()
    await vi.waitFor(() => expect(screen.getByRole('option', { name: /^Lisbona/ })).toBeInTheDocument())
    expect(screen.queryByText('Cerco luoghi…')).not.toBeInTheDocument()
  } finally {
    vi.useRealTimers()
    vi.restoreAllMocks()
  }
})

/** Come Harness, ma con qualsiasi prop in più (freeText, error…). */
function Ctl(props: Omit<Parameters<typeof PlaceInput>[0], 'value' | 'onChange'>) {
  const [v, setV] = useState<PlaceValue>({ name: '' })
  return <PlaceInput {...props} value={v} onChange={setV} />
}

it('troppe ricerche (429) lo dice com\'è; sotto le 3 lettere l\'avviso sparisce', async () => {
  server.use(http.get('http://localhost/api/places', () => HttpResponse.json({ title: 'Troppe ricerche', detail: 'Troppe ricerche, riprova tra poco' }, { status: 429 })))
  render(<Ctl id="d" label="Destinazione" />)
  const user = userEvent.setup()
  const input = screen.getByRole('combobox', { name: 'Destinazione' })
  await user.type(input, 'Lis')
  expect(await screen.findByText('Troppe ricerche, riprova tra poco')).toBeInTheDocument()
  await user.clear(input)
  await user.type(input, 'Li')
  expect(screen.queryByText('Troppe ricerche, riprova tra poco')).not.toBeInTheDocument()
})

it('con il testo libero valido (foto) il servizio giù è un suggerimento, non un errore', async () => {
  server.use(http.get('http://localhost/api/places', () => HttpResponse.json({ title: 'x', detail: 'x' }, { status: 503 })))
  render(<Ctl id="p" label="Luogo" freeText />)
  await userEvent.setup().type(screen.getByRole('combobox', { name: 'Luogo' }), 'Lis')
  expect(await screen.findByText('Proposte non disponibili: puoi scrivere il luogo a mano')).toBeInTheDocument()
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
})

it('servizio giù e modulo già inviato: si vede «non disponibile», non «Scegli dall\'elenco»', async () => {
  server.use(http.get('http://localhost/api/places', () => HttpResponse.json({ title: 'x', detail: 'x' }, { status: 503 })))
  render(<Ctl id="d2" label="Destinazione" error="Scegli la destinazione dall'elenco" />)
  await userEvent.setup().type(screen.getByRole('combobox', { name: 'Destinazione' }), 'Lis')
  expect(await screen.findByText('Ricerca dei luoghi non disponibile, riprova tra poco')).toBeInTheDocument()
  expect(screen.queryByText("Scegli la destinazione dall'elenco")).not.toBeInTheDocument()
})
