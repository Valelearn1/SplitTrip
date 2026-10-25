import { useId, useState, type InputHTMLAttributes } from 'react'
import { Icon } from './Icon'

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & { label: string; error?: string; hint?: string }

/** Campo password con l'occhiolino: mostra o nasconde quello che si scrive (utile al telefono). */
export function PasswordField({ label, error, hint, id, ...input }: Props) {
  const autoId = useId()
  const inputId = id ?? autoId
  const [shown, setShown] = useState(false)
  // Le regole si leggono prima di scrivere (riga sotto il campo), l'errore dopo: il lettore di schermo sente entrambi
  const describedBy = [hint && `${inputId}-hint`, error && `${inputId}-err`].filter(Boolean).join(' ') || undefined
  return (
    <div className="field">
      <label htmlFor={inputId}>{label}</label>
      <div className="input-wrap">
        <input id={inputId} type={shown ? 'text' : 'password'} className="password-input" aria-invalid={error ? true : undefined}
          aria-describedby={describedBy} {...input} />
        <button type="button" className="eye-btn" aria-controls={inputId} aria-pressed={shown}
          aria-label={shown ? 'Nascondi password' : 'Mostra password'} onClick={() => setShown((s) => !s)}>
          <Icon name={shown ? 'visibility_off' : 'visibility'} />
        </button>
      </div>
      {hint && <p id={`${inputId}-hint`} className="field-hint">{hint}</p>}
      {error && <p id={`${inputId}-err`} className="field-error">{error}</p>}
    </div>
  )
}
