import { z } from 'zod'
import type { ExpenseInput } from '../../shared/api/types'
import { normalizeSeparators } from '../../shared/utils/amount'
import { fractionDigits, maxCents, noCentsMessage } from '../../shared/utils/currencies'
import { toFxRate } from './useRate'
import { formatMoney } from '../../shared/utils/format'

/** "12,50", "12.50" o "1.234,56" → centesimi, senza tetto; null se non è un numero con al massimo 2 decimali. */
function centsOf(raw: string | undefined): number | null {
  if (raw === undefined) return null
  const normalized = normalizeSeparators(raw.trim()).replace(',', '.')
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null
  return Math.round(Number(normalized) * 100)
}

const hasCents = (cents: number | null) => cents !== null && cents % 100 !== 0
/** «Al massimo 999.999,99» o, per le valute senza centesimi, «Al massimo 99.999.999» (D-70). */
export const maxMessage = (currency: string) => (fractionDigits(currency) === 0 ? 'Al massimo 99.999.999' : 'Al massimo 999.999,99')

/** Oltre il tetto del server per quella valuta: il modulo lo dice invece di spegnere solo il bottone. */
export const isOverMax = (raw: string, currency = 'EUR') => (centsOf(raw) ?? 0) > maxCents(currency)

/** Come `centsOf`, ma null oltre il tetto della valuta e, per le valute senza centesimi (D-70), con decimali. */
export function parseCents(raw: string | undefined, currency = 'EUR'): number | null {
  const cents = centsOf(raw)
  if (cents === null || cents > maxCents(currency)) return null
  return fractionDigits(currency) === 0 && hasCents(cents) ? null : cents
}

/** Un importo da spesa o rimborso nella sua valuta: senza decimali se la valuta non ha centesimi, entro il tetto, maggiore di zero. */
export const amountSchema = (currency: string) => z.string()
  .refine((v) => fractionDigits(currency) !== 0 || !hasCents(centsOf(v)), noCentsMessage(currency))
  .refine((v) => (centsOf(v) ?? 0) <= maxCents(currency), maxMessage(currency))
  .refine((v) => (parseCents(v, currency) ?? 0) > 0, 'Inserisci un importo maggiore di zero')

const hasCount = (w: string | undefined) => w !== undefined && w.trim() !== ''

const shareSchema = z.object({
  participantId: z.string(),
  included: z.boolean(),
  amount: z.string().optional(),
  weight: z.string().optional(),
})

/**
 * Importo, valuta e cambio di una spesa o di un rimborso (D-69, D-70): decimali e tetto nella valuta dello scontrino;
 * con un'altra valuta, il cambio scritto e il convertito entro il tetto della valuta del viaggio.
 */
export function checkMoney(ctx: z.RefinementCtx, v: { amount: string; currency: string; perUnit?: string }, tripCurrency: string) {
  const symbol = tripCurrency === 'EUR' ? '€' : tripCurrency
  const amountIssue = amountSchema(v.currency).safeParse(v.amount).error?.issues[0]?.message
  if (amountIssue) ctx.addIssue({ code: 'custom', path: ['amount'], message: amountIssue })
  if (v.currency === tripCurrency) return
  if (toFxRate(v.perUnit ?? '') <= 0) {
    ctx.addIssue({ code: 'custom', path: ['perUnit'], message: `Scrivi quanti ${v.currency} vale 1 ${symbol}` })
  } else if (!amountIssue) {
    // il convertito deve stare nel tetto della valuta del viaggio (D-70)
    const converted = Math.round((centsOf(v.amount) ?? 0) * toFxRate(v.perUnit ?? ''))
    if (converted > maxCents(tripCurrency)) {
      ctx.addIssue({ code: 'custom', path: ['amount'], message: `Convertito supera ${maxMessage(tripCurrency).replace('Al massimo ', '')} ${tripCurrency}` })
    }
  }
}

/**
 * Il modulo spesa (D-69): `tripCurrency` è la valuta del viaggio; `currency` quella dello scontrino (di base la stessa) e
 * `perUnit` quanti `currency` vale 1 unità del viaggio («177,82»). Importo e quote si controllano nella valuta dello scontrino.
 */
export const expenseSchema = (tripCurrency: string) => z
  .object({
    description: z.string().trim().min(1, 'Scrivi cosa avete pagato').max(120, 'Al massimo 120 caratteri'),
    amount: z.string(),
    currency: z.string().length(3).optional(),
    perUnit: z.string().optional(),
    date: z.string().min(1, 'Scegli una data'),
    category: z.enum(['FOOD', 'TRANSPORT', 'LODGING', 'ACTIVITY', 'OTHER']),
    payerId: z.string().min(1, 'Chi ha pagato?'),
    splitType: z.enum(['EQUAL', 'CUSTOM', 'WEIGHT', 'DAYS']),
    dayBasis: z.enum(['DAYS', 'NIGHTS']),
    shares: z.array(shareSchema),
  })
  .superRefine((v, ctx) => {
    const currency = v.currency ?? tripCurrency
    checkMoney(ctx, { amount: v.amount, currency, perUnit: v.perUnit }, tripCurrency)
    const included = v.shares.filter((s) => s.included)
    if (included.length === 0) {
      ctx.addIssue({ code: 'custom', path: ['shares'], message: 'Seleziona almeno un partecipante' })
      return
    }
    // «conta per» in parti uguali (D-44), pesi e notti/giorni: numeri validi, non tutti a zero
    const counted = v.splitType === 'EQUAL' ? v.shares.some((s) => s.included && hasCount(s.weight)) : true
    if (v.splitType === 'WEIGHT' || v.splitType === 'DAYS' || (v.splitType === 'EQUAL' && counted)) {
      let sum = 0
      for (const [i, s] of v.shares.entries()) {
        if (!s.included) continue
        const cents = parseCents(s.weight ?? '')
        if (cents === null) {
          ctx.addIssue({ code: 'custom', path: ['shares', i, 'weight'], message: 'Numero non valido' })
          return
        }
        sum += cents
      }
      if (sum === 0) ctx.addIssue({ code: 'custom', path: ['shares'], message: 'Almeno uno deve contare per più di zero' })
      return
    }
    if (v.splitType === 'CUSTOM') {
      let sum = 0
      for (const [i, s] of v.shares.entries()) {
        if (!s.included) continue
        const cents = parseCents(s.amount ?? '', currency)
        if (cents === null) {
          ctx.addIssue({ code: 'custom', path: ['shares', i, 'amount'], message: 'Importo non valido' })
          return
        }
        sum += cents
      }
      const total = parseCents(v.amount, currency) ?? 0
      if (sum !== total) {
        const diff = (total - sum) / 100
        ctx.addIssue({ code: 'custom', path: ['shares'], message: `Le quote non tornano: ${diff > 0 ? 'mancano' : 'avanzano'} ${formatMoney(Math.abs(diff), currency)}` })
      }
    }
  })

export type ExpenseForm = z.infer<ReturnType<typeof expenseSchema>>

export function toExpenseInput(form: ExpenseForm, tripCurrency = 'EUR'): ExpenseInput {
  const currency = form.currency ?? tripCurrency
  const included = form.shares.filter((s) => s.included)
  // Parti uguali dove qualcuno conta per più o meno di 1 si salva come WEIGHT: backend invariato (D-44)
  const counts = form.splitType === 'EQUAL' && included.some((s) => hasCount(s.weight) && parseCents(s.weight) !== 100)
  const splitType = counts ? 'WEIGHT' : form.splitType
  return {
    description: form.description,
    amount: (parseCents(form.amount, currency) ?? 0) / 100,
    currency,
    fxRate: currency === tripCurrency ? 1 : toFxRate(form.perUnit ?? ''),
    date: form.date,
    category: form.category,
    payerId: form.payerId,
    splitType,
    ...(form.splitType === 'DAYS' ? { dayBasis: form.dayBasis } : {}),
    shares: included.map((s) => {
      if (form.splitType === 'CUSTOM') return { participantId: s.participantId, amount: (parseCents(s.amount, currency) ?? 0) / 100 }
      if (splitType === 'WEIGHT' || splitType === 'DAYS') return { participantId: s.participantId, weight: (parseCents(s.weight) ?? 0) / 100 }
      return { participantId: s.participantId }
    }),
  }
}
