/** Valute più comuni in viaggio dall'Italia; il backend accetta qualsiasi codice ISO a 3 lettere. */
export const TRAVEL_CURRENCIES = ['EUR', 'USD', 'GBP', 'CHF', 'CZK', 'HUF', 'PLN', 'DKK', 'SEK', 'NOK', 'TRY', 'MAD', 'JPY', 'CAD', 'AUD'] as const

const names = new Intl.DisplayNames('it', { type: 'currency' })

function symbol(code: string): string {
  const part = new Intl.NumberFormat('it-IT', { style: 'currency', currency: code, currencyDisplay: 'narrowSymbol' })
    .formatToParts(0).find((p) => p.type === 'currency')
  return part?.value ?? code
}

/** «Euro (€)», «Dollaro statunitense ($)», «Franco svizzero (CHF)». */
export function currencyLabel(code: string): string {
  const name = names.of(code) ?? code
  return `${name.charAt(0).toUpperCase()}${name.slice(1)} (${symbol(code)})`
}

/** D-70: valute senza centesimi, lo stesso elenco di BE/.../common/Currencies.java (Intl dà già 0 decimali a JPY e HUF, Java no a HUF). */
export const NO_CENTS: ReadonlySet<string> = new Set(['JPY', 'HUF', 'ISK', 'KRW'])
export const fractionDigits = (currency: string): 0 | 2 => (NO_CENTS.has(currency) ? 0 : 2)
/** Tetto in centesimi: 999.999,99 con centesimi, 99.999.999 senza. */
export const maxCents = (currency: string) => (fractionDigits(currency) === 0 ? 9_999_999_900 : 99_999_999)
/** «Lo yen non ha centesimi», «Il fiorino non ha centesimi»: per i messaggi dei campi importo. */
export function noCentsMessage(currency: string): string {
  const short = (names.of(currency) ?? currency).toLowerCase().split(' ')[0]
  const article = /^(yen|zloty)/.test(short) ? 'Lo' : /a$/.test(short) ? 'La' : 'Il'
  return `${article} ${short} non ha centesimi`
}
