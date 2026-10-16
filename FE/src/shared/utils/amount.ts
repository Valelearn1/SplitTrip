import type { ChangeEventHandler } from 'react'

export const MAX_AMOUNT_CENTS = 99_999_999   // 999.999,99: lo stesso tetto del server

/**
 * Tiene solo un importo scrivibile: cifre e una virgola, al massimo 6 cifre intere e 2 decimali.
 * Con virgola e punto insieme è decimale l'ultimo dei due («1.234,56», «1,234.56»); i soli punti seguiti da
 * gruppi di 3 cifre sono migliaia («1.234»); un punto con 1–2 cifre dopo è la virgola decimale («12.5»).
 */
export function sanitizeAmount(raw: string): string {
  let s = raw.replace(/[^\d.,]/g, '')
  const lastComma = s.lastIndexOf(','), lastDot = s.lastIndexOf('.')
  if (lastComma >= 0 && lastDot >= 0) {
    const decimal = lastComma > lastDot ? ',' : '.'
    s = s.replace(decimal === ',' ? /\./g : /,/g, '').replace('.', ',')
  } else if (/^\d{1,3}(\.\d{3})+$/.test(s)) {
    s = s.replace(/\./g, '')
  } else {
    s = s.replace(/\./g, ',')
  }
  const [intRaw, ...rest] = s.split(',')
  const intPart = intRaw.replace(/^0+(?=\d)/, '').slice(0, 6)
  if (rest.length === 0) return intPart
  return `${intPart || '0'},${rest.join('').slice(0, 2)}`
}

/** Avvolge l'onChange di un input (anche quello di react-hook-form) ripulendo il valore prima di passarlo. */
export function withAmountSanitizer<P extends { onChange?: ChangeEventHandler<HTMLInputElement> }>(props: P): P {
  return { ...props, onChange: (e) => { e.target.value = sanitizeAmount(e.target.value); props.onChange?.(e) } }
}
