import { ApiError, isOfflineError } from '../api/client'
import { Icon } from './Icon'

/** offlineMessage: il testo da usare quando manca la rete in quel contesto (es. «Serve la rete per entrare»). */
export function FormError({ error, offlineMessage }: { error: unknown; offlineMessage?: string }) {
  if (!error) return null
  const message = isOfflineError(error) && offlineMessage ? offlineMessage
    : error instanceof ApiError ? error.detail : 'Qualcosa è andato storto. Riprova.'
  return (
    <p role="alert" className="form-error"><Icon name="error" /><span>{message}</span></p>
  )
}
