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
