import { useId, type InputHTMLAttributes } from 'react'

type Props = InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }

export function Field({ label, error, id, ...input }: Props) {
  const autoId = useId()
  const inputId = id ?? autoId
  return (
    <div className="field">
      <label htmlFor={inputId}>{label}</label>
      <input id={inputId} aria-invalid={error ? true : undefined} aria-describedby={error ? `${inputId}-err` : undefined} {...input} />
      {error && <p id={`${inputId}-err`} className="field-error">{error}</p>}
    </div>
  )
}
