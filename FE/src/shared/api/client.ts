import { onlineManager } from '@tanstack/react-query'

export type FieldError = { field: string; message: string }

export class ApiError extends Error {
  status: number
  title: string
  detail: string
  errors: FieldError[]

  constructor(status: number, title: string, detail: string, errors: FieldError[] = []) {
    super(detail)
    this.name = 'ApiError'
    this.status = status
    this.title = title
    this.detail = detail
    this.errors = errors
  }
}

export const OFFLINE_DETAIL = 'Sei offline: la modifica non è stata salvata. Riprova quando torna la rete'

/** fetch rifiutata (niente rete o server irraggiungibile) → ApiError leggibile; un'interruzione voluta resta com'è. */
async function send(url: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(url, init)
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') throw e
    throw onlineManager.isOnline()
      ? new ApiError(0, 'Rete', 'Il server non risponde, riprova tra poco')
      : new ApiError(0, 'Offline', OFFLINE_DETAIL)
  }
}

export const isOfflineError = (e: unknown) => e instanceof ApiError && e.status === 0 && e.title === 'Offline'

const BASE: string = import.meta.env.VITE_API_URL ?? '/api'

let getToken: () => string | null = () => null
let onUnauthorized: () => void = () => {}

export function configureClient(opts: { getToken: () => string | null; onUnauthorized: () => void }) {
  getToken = opts.getToken
  onUnauthorized = opts.onUnauthorized
}

type Options = { method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'; body?: unknown; signal?: AbortSignal }

export async function api<T>(path: string, options: Options = {}): Promise<T> {
  const headers: Record<string, string> = {}
  // con FormData il browser imposta da solo multipart/form-data e il boundary
  const isForm = options.body instanceof FormData
  if (options.body !== undefined && !isForm) headers['Content-Type'] = 'application/json'
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await send(BASE + path, {
    method: options.method ?? 'GET',
    headers,
    body: options.body === undefined ? undefined : isForm ? (options.body as FormData) : JSON.stringify(options.body),
    signal: options.signal,
  })

  if (res.status === 204) return undefined as T
  const text = await res.text()
  const data = text ? JSON.parse(text) : null

  if (!res.ok) {
    if (res.status === 401 && !path.startsWith('/auth/')) onUnauthorized()
    throw new ApiError(res.status, data?.title ?? 'Errore', data?.detail ?? `Errore ${res.status}`, data?.errors ?? [])
  }
  return data as T
}

/** Scarica un'immagine protetta dal Bearer; da mostrare con URL.createObjectURL (vedi AuthImage). */
export async function apiBlob(path: string): Promise<Blob> {
  const token = getToken()
  const res = await send(BASE + path, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
  if (!res.ok) {
    if (res.status === 401) onUnauthorized()
    throw new ApiError(res.status, 'Errore', `Immagine non disponibile (${res.status})`)
  }
  return res.blob()
}
