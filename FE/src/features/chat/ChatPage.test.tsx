import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { onlineManager } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { server } from '../../test/server'
import { AUTH_STORAGE_KEY } from '../auth/authContext'
import { loginAsVale, mount, msg, push, sent } from './chatTestUtils'

beforeEach(loginAsVale)

it('mostra chi scrive, le righe evento con il link e i messaggi eliminati', async () => {
  mount('ONGOING', [
    msg({ id: 'm3', authorParticipantId: 'p1', authorName: 'Vale', authorUserId: 'u1', content: 'Arrivo alle 20' }),
    msg({ id: 'm2', deleted: true, content: null }),
    msg({ id: 'e1', kind: 'EVENT', authorParticipantId: null, authorName: null, authorUserId: null, content: 'Marco ha aggiunto «Cena» · 45,00 €', eventType: 'EXPENSE_CREATED', refId: 'x1' }),
  ])
  expect(await screen.findByRole('log', { name: 'Messaggi' })).toBeInTheDocument()
  expect(await screen.findByText('Arrivo alle 20')).toBeInTheDocument() // il log c'è subito, i messaggi arrivano dopo
  expect(screen.getByText('Tu')).toBeInTheDocument()
  expect(screen.getByText('Messaggio eliminato')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Marco ha aggiunto «Cena» · 45,00 €' })).toHaveAttribute('href', '/trips/t1/expenses/x1/edit')
})

it('il mio messaggio compare una volta anche se torna dal canale', async () => {
  mount()
  const user = userEvent.setup()
  await user.type(await screen.findByRole('textbox', { name: 'Scrivi un messaggio' }), 'Ci vediamo alle 20')
  await user.click(screen.getByRole('button', { name: 'Invia' }))
  await waitFor(() => expect(sent).toEqual([{ content: 'Ci vediamo alle 20' }]))
  act(() => push({ type: 'message.created', data: msg({ id: 'mine', authorParticipantId: 'p1', authorName: 'Vale', authorUserId: 'u1', content: 'Ci vediamo alle 20' }) }))
  expect(await screen.findAllByText('Ci vediamo alle 20')).toHaveLength(1)
  expect(screen.getByRole('textbox', { name: 'Scrivi un messaggio' })).toHaveValue('')
})

it('i messaggi e «sta scrivendo» degli altri arrivano dal canale', async () => {
  mount()
  await screen.findByRole('log', { name: 'Messaggi' })
  act(() => push({ type: 'typing', data: { participantId: 'p2', name: 'Marco' } }))
  expect(await screen.findByText('Marco sta scrivendo…')).toBeInTheDocument()
  act(() => push({ type: 'message.created', data: msg({ id: 'n1', content: 'Sono in ritardo' }) }))
  expect(await screen.findByText('Sono in ritardo')).toBeInTheDocument()
})

it('a viaggio chiuso la chat è in sola lettura', async () => {
  mount('CLOSED')
  expect(await screen.findByText('Il viaggio è chiuso: la chat è in sola lettura')).toBeInTheDocument()
  expect(screen.queryByRole('textbox', { name: 'Scrivi un messaggio' })).not.toBeInTheDocument()
})

// jsdom non calcola altezze: si simula una pagina lunga, letta più in alto del fondo
function pageHeight(get: () => number) {
  Object.defineProperty(document.documentElement, 'scrollHeight', { configurable: true, get })
}
afterEach(() => {
  delete (document.documentElement as { scrollHeight?: number }).scrollHeight
  vi.restoreAllMocks()
})

it('se sto leggendo più su, un messaggio altrui non mi sposta: compare «Nuovi messaggi»', async () => {
  mount('ONGOING', [msg({ id: 'm1', content: 'Primo' })])
  await screen.findByText('Primo')
  pageHeight(() => 5000) // su mobile scorre la pagina, non l'elenco
  act(() => { window.dispatchEvent(new Event('scroll')) })
  act(() => push({ type: 'message.created', data: msg({ id: 'n1', content: 'Sono in ritardo' }) }))
  expect(await screen.findByRole('button', { name: /Nuovi messaggi/ })).toBeInTheDocument()
})

it('caricando i messaggi precedenti la posizione di lettura resta ferma', async () => {
  let height = 1000
  const scrollBy = vi.spyOn(window, 'scrollBy').mockImplementation(() => {})
  mount('ONGOING', [msg({ id: 'm2', content: 'Recente' })], { items: [msg({ id: 'm1', content: 'Vecchio' })], onLoad: () => { height = 1600 } })
  await screen.findByText('Recente')
  pageHeight(() => height)
  await userEvent.setup().click(screen.getByRole('button', { name: 'Messaggi precedenti' }))
  expect(await screen.findByText('Vecchio')).toBeInTheDocument()
  await waitFor(() => expect(scrollBy).toHaveBeenCalledWith(0, 600))
})

it('«Indietro» riporta al viaggio anche se la chat è stata aperta da un link', async () => {
  mount()
  await userEvent.setup().click(await screen.findByRole('button', { name: 'Indietro' }))
  expect(await screen.findByText('Panoramica del viaggio')).toBeInTheDocument()
})

it('il suono dei messaggi si spegne dalla chat e resta sull’account (D-48)', async () => {
  let sent: unknown
  server.use(http.patch('http://localhost/api/me/preferences', async ({ request }) => {
    sent = await request.json()
    return HttpResponse.json({ id: 'u1', email: 'v@e.it', displayName: 'Vale', hasAvatar: false, preferredCurrency: 'EUR', chatSound: false, reduceMotion: false })
  }))
  mount()
  const toggle = await screen.findByRole('button', { name: 'Suono dei messaggi' })
  expect(toggle).toHaveAttribute('aria-pressed', 'true')
  await userEvent.setup().click(toggle)
  expect(toggle).toHaveAttribute('aria-pressed', 'false')
  await waitFor(() => expect(sent).toEqual({ chatSound: false }))
  expect(JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY)!).user.chatSound).toBe(false)
})

it('offline aprire la chat o vedere un messaggio non prova a segnare «letti» (niente avviso «non è stato salvato»)', async () => {
  mount('ONGOING', [msg({ id: 'm1', content: 'Ciao' })])
  expect(await screen.findByText('Ciao')).toBeInTheDocument()
  let reads = 0
  server.use(http.post('http://localhost/api/trips/t1/messages/read', () => { reads++; return new HttpResponse(null, { status: 204 }) }))
  act(() => onlineManager.setOnline(false))
  act(() => push({ type: 'message.created', data: msg({ id: 'n2', content: 'Arrivato prima che cadesse la rete' }) }))
  expect(await screen.findByText('Arrivato prima che cadesse la rete')).toBeInTheDocument()
  await new Promise((r) => setTimeout(r, 100))
  expect(reads).toBe(0)
})

