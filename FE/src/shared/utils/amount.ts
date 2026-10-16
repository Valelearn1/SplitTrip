import type { ChangeEvent, ChangeEventHandler, FocusEventHandler } from 'react'

export const MAX_AMOUNT_CENTS = 99_999_999   // 999.999,99: lo stesso tetto del server
const MAX_INT_DIGITS = 6

/**
 * Punti e virgole come li scrive una persona → «1234,56». Con virgola e punto insieme è decimale l'ultimo dei due
 * («1.234,56», «1,234.56»); i soli punti seguiti da gruppi di 3 cifre sono migliaia («1.234»); altrimenti il punto è
 * la virgola decimale («12.5»).
 */
export function normalizeSeparators(s: string): string {
  const lastComma = s.lastIndexOf(','), lastDot = s.lastIndexOf('.')
  if (lastComma >= 0 && lastDot >= 0) {
    const decimal = lastComma > lastDot ? ',' : '.'
    return s.replace(decimal === ',' ? /\./g : /,/g, '').replace('.', ',')
  }
  if (/^[1-9]\d{0,2}(\.\d{3})+$/.test(s)) return s.replace(/\./g, '')
  return s.replace(/\./g, ',')
}

/**
 * Un importo incollato: solo cifre e una virgola, al massimo 2 decimali. Le cifre intere non si tagliano: oltre il
 * tetto lo dice la validazione, invece di salvare un numero diverso.
 */
export function sanitizeAmount(raw: string): string {
  const [intRaw, ...rest] = normalizeSeparators(raw.replace(/[^\d.,]/g, '')).split(',')
  const intPart = intRaw.replace(/^0+(?=\d)/, '')
  if (rest.length === 0) return intPart
  return `${intPart || '0'},${rest.join('').slice(0, 2)}`
}

const digits = (s: string) => s.replace(/\D/g, '').length

/** Un importo a metà scrittura che può ancora diventare valido (i punti delle migliaia restano finché si scrive). */
function isTypeable(s: string): boolean {
  if (/^\d*$/.test(s)) return s.length <= MAX_INT_DIGITS
  if (/^(\d*|[1-9]\d{0,2}(\.\d{3})*),\d{0,2}$/.test(s)) return digits(s.split(',')[0]) <= MAX_INT_DIGITS
  const decimal = /^(\d+)\.\d{0,2}$/.exec(s)
  if (decimal && decimal[1].length <= MAX_INT_DIGITS) return true
  return /^[1-9]\d{0,2}(\.\d{3})*\.\d{0,3}$/.test(s) && digits(s) <= MAX_INT_DIGITS
}

/** Dove `raw` ha un carattere in più di `prev` (un tasto), oppure -1 (incolla, completamento, cancellazione). */
function insertedAt(prev: string, raw: string): number {
  if (raw.length !== prev.length + 1) return -1
  let i = 0
  while (i < prev.length && prev[i] === raw[i]) i++
  return raw.slice(i + 1) === prev.slice(i) ? i : -1
}

/**
 * Il valore del campo dopo una modifica. Un tasto che rende l'importo impossibile (lettera, separatore in più, terzo
 * decimale, settima cifra intera) si rifiuta e il campo resta com'era; un incolla si ripulisce con `sanitizeAmount`.
 */
export function nextAmount(prev: string, raw: string): string {
  if (insertedAt(prev, raw) < 0) return isTypeable(raw) ? raw : sanitizeAmount(raw)
  const typed = raw.replace(/^0+(?=\d)/, '').replace(/^,/, '0,')
  return isTypeable(typed) ? typed : prev
}

/** Uscendo dal campo: la forma con la sola virgola («1.234,5» → «1234,5»), senza virgola finale. */
export function tidyAmount(raw: string): string {
  return sanitizeAmount(raw).replace(/,$/, '')
}

type InputHandlers = {
  onChange?: ChangeEventHandler<HTMLInputElement>
  onFocus?: FocusEventHandler<HTMLInputElement>
  onBlur?: FocusEventHandler<HTMLInputElement>
}

const lastValue = new WeakMap<EventTarget, string>()   // l'ultimo valore pulito di ogni campo importo

/** Avvolge un input (anche quello di react-hook-form): ogni modifica passa da `nextAmount`, l'uscita da `tidyAmount`. */
export function withAmountSanitizer<P extends InputHandlers>(props: P): P {
  return {
    ...props,
    onFocus: (e) => { lastValue.set(e.target, e.target.value); props.onFocus?.(e) },
    onChange: (e) => {
      e.target.value = nextAmount(lastValue.get(e.target) ?? '', e.target.value)
      lastValue.set(e.target, e.target.value)
      props.onChange?.(e)
    },
    onBlur: (e) => {
      const tidy = tidyAmount(e.target.value)
      if (tidy !== e.target.value) {
        e.target.value = tidy
        props.onChange?.(e as unknown as ChangeEvent<HTMLInputElement>)   // il valore cambia anche per chi ascolta solo onChange
      }
      props.onBlur?.(e)
    },
  }
}
