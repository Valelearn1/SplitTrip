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
  if (options.body !== undefined) headers['Content-Type'] = 'application/json'
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(BASE + path, {
    method: options.method ?? 'GET',
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
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
