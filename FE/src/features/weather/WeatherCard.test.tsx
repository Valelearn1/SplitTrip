import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import type { ReactNode } from 'react'
import { expect, it } from 'vitest'
import { server } from '../../test/server'
import { WeatherCard } from './WeatherCard'

const wrap = (ui: ReactNode) => render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>{ui}</QueryClientProvider>)

it('senza dati non mostra nulla', async () => {
  let called = false
  server.use(http.get('http://localhost/api/trips/t1/weather', () => { called = true; return HttpResponse.json({ days: [] }) }))
  const { container } = wrap(<WeatherCard tripId="t1" />)
  await waitFor(() => expect(called).toBe(true))
  expect(container).toBeEmptyDOMElement()
})

it('una colonna per giorno, con il testo dell\'icona e le temperature', async () => {
  server.use(http.get('http://localhost/api/trips/t1/weather', () => HttpResponse.json({ days: [{ date: '2026-11-02', code: 61, tMin: 11, tMax: 18 }] })))
  wrap(<WeatherCard tripId="t1" />)
  expect(await screen.findByRole('img', { name: 'pioggia' })).toBeInTheDocument()
  expect(screen.getByText('11° / 18°')).toBeInTheDocument()
})
