import { ApiError } from '../api/client'
import { Icon } from './Icon'

export function FormError({ error }: { error: unknown }) {
  if (!error) return null
  const message = error instanceof ApiError ? error.detail : 'Qualcosa è andato storto. Riprova.'
  return (
    <p role="alert" className="form-error"><Icon name="error" /><span>{message}</span></p>
  )
}
