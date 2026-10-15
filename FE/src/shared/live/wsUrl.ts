type Env = { VITE_WS_URL?: string; VITE_API_URL?: string }
type Loc = { protocol: string; host: string }

/** In produzione l'API è su un altro host: https://…/api → wss://…/ws. In locale passa dal proxy di Vite. */
export function wsUrl(env: Env = import.meta.env as Env, loc: Loc = window.location): string {
  if (env.VITE_WS_URL) return env.VITE_WS_URL
  const api = env.VITE_API_URL ?? '/api'
  if (/^https?:\/\//.test(api)) return api.replace(/^http/, 'ws').replace(/\/api\/?$/, '/ws')
  return `${loc.protocol === 'https:' ? 'wss' : 'ws'}://${loc.host}/ws`
}
