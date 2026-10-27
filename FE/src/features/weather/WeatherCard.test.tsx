import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import type { ReactNode } from 'react'
import { expect, it } from 'vitest'
import { server } from '../../test/server'
import { WeatherCard } from './WeatherCard'
import { OPEN_METEO_FORECAST } from './weatherApi'

const wrap = (ui: ReactNode) => render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>{ui}</QueryClientProvider>)

// D-76: il meteo lo chiede il browser a Open-Meteo, con le coordinate del viaggio (non più il server, che su Render ha l'IP condiviso)
const london = { id: 't1', latitude: 51.5085, longitude: -0.1257, startDate: '2026-10-27', endDate: '2026-10-28' }

const forecast = (daily: object) => http.get(OPEN_METEO_FORECAST, () => HttpResponse.json({ daily }))

it('chiede le previsioni a Open-Meteo con le coordinate del viaggio e tiene solo i giorni del viaggio', async () => {
  let url: URL | undefined
  server.use(http.get(OPEN_METEO_FORECAST, ({ request }) => {
    url = new URL(request.url)
    return HttpResponse.json({ daily: {
      time: ['2026-10-26', '2026-10-27', '2026-10-28', '2026-10-29'],
      weather_code: [0, 61, 3, 3], temperature_2m_max: [20, 18, 15.6, 14], temperature_2m_min: [12, 11, 9.4, 8],
    } })
  }))
  wrap(<WeatherCard trip={london} />)
  expect(await screen.findByRole('img', { name: 'pioggia' })).toBeInTheDocument()
  expect(screen.getByText('11° / 18°')).toBeInTheDocument()
  expect(screen.getByRole('img', { name: 'nuvoloso' })).toBeInTheDocument()
  expect(screen.getByText('9° / 16°')).toBeInTheDocument()
  expect(screen.getAllByRole('listitem')).toHaveLength(2)   // il 26 e il 29 sono fuori dal viaggio
  expect(url?.searchParams.get('latitude')).toBe('51.5085')
  expect(url?.searchParams.get('longitude')).toBe('-0.1257')
  expect(url?.searchParams.get('daily')).toBe('weather_code,temperature_2m_max,temperature_2m_min')
})

it('salta il giorno che Open-Meteo manda senza dati', async () => {
  server.use(forecast({ time: ['2026-10-27', '2026-10-28'], weather_code: [61, null], temperature_2m_max: [18, null], temperature_2m_min: [11, null] }))
  wrap(<WeatherCard trip={london} />)
  expect(await screen.findByRole('img', { name: 'pioggia' })).toBeInTheDocument()
  expect(screen.getAllByRole('listitem')).toHaveLength(1)
})

it('senza coordinate non chiama nessuno e non mostra nulla', async () => {
  let called = false
  server.use(http.get(OPEN_METEO_FORECAST, () => { called = true; return HttpResponse.json({ daily: {} }) }))
  const { container } = wrap(<WeatherCard trip={{ ...london, latitude: null, longitude: null }} />)
  await new Promise((r) => setTimeout(r, 50))
  expect(called).toBe(false)
  expect(container).toBeEmptyDOMElement()
})

it('se Open-Meteo rifiuta (429) non mostra nulla: mai un errore in panoramica', async () => {
  let called = false
  server.use(http.get(OPEN_METEO_FORECAST, () => { called = true; return HttpResponse.json({ error: true, reason: 'Daily API request limit exceeded' }, { status: 429 }) }))
  const { container } = wrap(<WeatherCard trip={london} />)
  await waitFor(() => expect(called).toBe(true))
  await new Promise((r) => setTimeout(r, 50))
  expect(container).toBeEmptyDOMElement()
})

it('senza giorni nel viaggio non mostra nulla', async () => {
  server.use(forecast({ time: ['2026-11-20'], weather_code: [0], temperature_2m_max: [10], temperature_2m_min: [2] }))
  const { container } = wrap(<WeatherCard trip={london} />)
  await new Promise((r) => setTimeout(r, 50))
  expect(container).toBeEmptyDOMElement()
})
