import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { server } from '../../test/server'
import { onlineManager } from '@tanstack/react-query'
import { api, ApiError, configureClient, OFFLINE_DETAIL } from './client'

describe('api client', () => {
  it('aggiunge il Bearer e legge il JSON', async () => {
    configureClient({ getToken: () => 'tok', onUnauthorized: () => {} })
    server.use(
      http.get('http://localhost/api/me', ({ request }) => {
        expect(request.headers.get('Authorization')).toBe('Bearer tok')
        return HttpResponse.json({ id: '1', email: 'a@b.it', displayName: 'A' })
      }),
    )
    await expect(api('/me')).resolves.toEqual({ id: '1', email: 'a@b.it', displayName: 'A' })
  })

  it('trasforma i Problem Details in ApiError con gli errori di campo', async () => {
    configureClient({ getToken: () => null, onUnauthorized: () => {} })
    server.use(
      http.post('http://localhost/api/auth/register', () =>
        HttpResponse.json(
          { status: 400, title: 'Validazione fallita', detail: 'Alcuni campi non sono validi', errors: [{ field: 'password', message: 'troppo corta' }] },
          { status: 400, headers: { 'Content-Type': 'application/problem+json' } },
        ),
      ),
    )
    const err = (await api('/auth/register', { method: 'POST', body: {} }).catch((e: unknown) => e)) as ApiError
    expect(err).toBeInstanceOf(ApiError)
    expect(err.status).toBe(400)
    expect(err.errors).toEqual([{ field: 'password', message: 'troppo corta' }])
  })

  it('su 401 fuori da /auth chiama onUnauthorized', async () => {
    const onUnauthorized = vi.fn()
    configureClient({ getToken: () => 'scaduto', onUnauthorized })
    server.use(http.get('http://localhost/api/trips', () => HttpResponse.json({ status: 401 }, { status: 401 })))
    await expect(api('/trips')).rejects.toBeInstanceOf(ApiError)
    expect(onUnauthorized).toHaveBeenCalledOnce()
  })

  it('204 restituisce undefined', async () => {
    configureClient({ getToken: () => 'tok', onUnauthorized: () => {} })
    server.use(http.delete('http://localhost/api/trips/1', () => new HttpResponse(null, { status: 204 })))
    await expect(api('/trips/1', { method: 'DELETE' })).resolves.toBeUndefined()
  })

  it('senza rete una richiesta fallisce con un errore «Offline» leggibile, non un TypeError', async () => {
    server.use(http.post('http://localhost/api/trips/t1/expenses', () => HttpResponse.error()))
    onlineManager.setOnline(false)
    const error = await api('/trips/t1/expenses', { method: 'POST', body: {} }).catch((e) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ status: 0, title: 'Offline', detail: OFFLINE_DETAIL })
  })

  it('con la rete ma il server irraggiungibile lo dice', async () => {
    server.use(http.get('http://localhost/api/trips', () => HttpResponse.error()))
    const error = await api('/trips').catch((e) => e)
    expect(error).toMatchObject({ status: 0, title: 'Rete', detail: 'Il server non risponde, riprova tra poco' })
  })
})
