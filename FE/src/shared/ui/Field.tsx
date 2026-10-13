import { useId, type InputHTMLAttributes } from 'react'

type Props = InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; suffix?: string }

export function Field({ label, error, suffix, id, ...input }: Props) {
  const autoId = useId()
  const inputId = id ?? autoId
  return (
    <div className="field">
      <label htmlFor={inputId}>{label}</label>
      {suffix ? (
        <div className="input-wrap">
          <input id={inputId} aria-invalid={error ? true : undefined} aria-describedby={error ? `${inputId}-err` : undefined} {...input} />
          <span className="suffix" aria-hidden="true">{suffix}</span>
        </div>
      ) : (
        <input id={inputId} aria-invalid={error ? true : undefined} aria-describedby={error ? `${inputId}-err` : undefined} {...input} />
      )}
      {error && <p id={`${inputId}-err`} className="field-error">{error}</p>}
    </div>
  )
}
