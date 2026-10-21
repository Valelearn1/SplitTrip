/** D-66: il giro e2e usa un backend sulla 8081; senza variabile resta quello di sviluppo. */
export function apiTarget(env: Record<string, string | undefined>) {
  const http = env.API_TARGET ?? 'http://localhost:8080'
  return { http, ws: http.replace(/^http/, 'ws') }
}
