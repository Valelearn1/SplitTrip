import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { expect, it } from 'vitest'
import { renderWithProviders } from '../../test/renderWithProviders'
import { server } from '../../test/server'
import { AiTipsCard } from './AiTipsCard'

const tips = [
  { title: 'Tram 28', text: 'Prendilo presto la mattina.', category: 'SEE' },
  { title: 'Pastéis', text: 'A Belém, caldi.', category: 'EAT' },
  { title: 'Ombrello', text: 'Pioggia prevista.', category: 'PACK' },
]

it('senza chiave la card non compare', async () => {
  server.use(http.get('http://localhost/api/trips/t1/ai/tips', () => HttpResponse.json({ available: false, remainingToday: 5, tips: [], generatedAt: null })))
  renderWithProviders([{ path: '/', element: <><AiTipsCard tripId="t1" destination="Lisbona" canWrite /><p>fine</p></> }], '/')
  await screen.findByText('fine')
  await new Promise((r) => setTimeout(r, 50))
  expect(screen.queryByRole('heading', { name: 'Consigli per Lisbona' })).not.toBeInTheDocument()
})

it('genera i consigli e mostra quante generazioni restano', async () => {
  server.use(
    http.get('http://localhost/api/trips/t1/ai/tips', () => HttpResponse.json({ available: true, remainingToday: 5, tips: [], generatedAt: null })),
    http.post('http://localhost/api/trips/t1/ai/tips', () => HttpResponse.json({ available: true, remainingToday: 4, tips, generatedAt: '2026-11-01T10:00:00Z' })),
  )
  renderWithProviders([{ path: '/', element: <AiTipsCard tripId="t1" destination="Lisbona" canWrite /> }], '/')
  await userEvent.setup().click(await screen.findByRole('button', { name: 'Genera consigli' }))
  expect(await screen.findByText('Tram 28')).toBeInTheDocument()
  expect(screen.getByText('Da mangiare')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Rigenera (4 rimaste oggi)' })).toBeInTheDocument()
  expect(screen.getByText('Generato con AI · può contenere errori')).toBeInTheDocument()
})

it('al limite giornaliero mostra il messaggio del server', async () => {
  server.use(
    http.get('http://localhost/api/trips/t1/ai/tips', () => HttpResponse.json({ available: true, remainingToday: 1, tips, generatedAt: '2026-11-01T10:00:00Z' })),
    http.post('http://localhost/api/trips/t1/ai/tips', () => HttpResponse.json({ title: 'Limite raggiunto', detail: 'Hai usato le 5 generazioni di oggi' }, { status: 429 })),
  )
  renderWithProviders([{ path: '/', element: <AiTipsCard tripId="t1" destination="Lisbona" canWrite /> }], '/')
  await userEvent.setup().click(await screen.findByRole('button', { name: 'Rigenera (1 rimaste oggi)' }))
  expect(await screen.findByText('Hai usato le 5 generazioni di oggi')).toBeInTheDocument()
})
