import { z } from 'zod'
import type { ExpenseInput } from '../../shared/api/types'
import { formatMoney } from '../../shared/utils/format'

/** "12,50" o "12.50" → 1250 centesimi; null se non è un importo valido. */
export function parseCents(raw: string | undefined): number | null {
  if (raw === undefined) return null
  const normalized = raw.trim().replace(',', '.')
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null
  return Math.round(Number(normalized) * 100)
}

const shareSchema = z.object({
  participantId: z.string(),
  included: z.boolean(),
  amount: z.string().optional(),
})

export const expenseSchema = z
  .object({
    description: z.string().trim().min(1, 'Scrivi cosa avete pagato').max(120, 'Al massimo 120 caratteri'),
    amount: z.string().refine((v) => (parseCents(v) ?? 0) > 0, 'Inserisci un importo maggiore di zero'),
    date: z.string().min(1, 'Scegli una data'),
    category: z.enum(['FOOD', 'TRANSPORT', 'LODGING', 'ACTIVITY', 'OTHER']),
    payerId: z.string().min(1, 'Chi ha pagato?'),
    splitType: z.enum(['EQUAL', 'CUSTOM', 'WEIGHT', 'DAYS']),
    shares: z.array(shareSchema),
  })
  .superRefine((v, ctx) => {
    const included = v.shares.filter((s) => s.included)
    if (included.length === 0) {
      ctx.addIssue({ code: 'custom', path: ['shares'], message: 'Seleziona almeno un partecipante' })
      return
    }
    if (v.splitType === 'CUSTOM') {
      let sum = 0
      for (const [i, s] of v.shares.entries()) {
        if (!s.included) continue
        const cents = parseCents(s.amount ?? '')
        if (cents === null) {
          ctx.addIssue({ code: 'custom', path: ['shares', i, 'amount'], message: 'Importo non valido' })
          return
        }
        sum += cents
      }
      const total = parseCents(v.amount) ?? 0
      if (sum !== total) {
        const diff = (total - sum) / 100
        ctx.addIssue({ code: 'custom', path: ['shares'], message: `Le quote non tornano: ${diff > 0 ? 'mancano' : 'avanzano'} ${formatMoney(Math.abs(diff))}` })
      }
    }
  })

export type ExpenseForm = z.infer<typeof expenseSchema>

export function toExpenseInput(form: ExpenseForm): ExpenseInput {
  const included = form.shares.filter((s) => s.included)
  return {
    description: form.description,
    amount: (parseCents(form.amount) ?? 0) / 100,
    date: form.date,
    category: form.category,
    payerId: form.payerId,
    splitType: form.splitType,
    shares: included.map((s) => (form.splitType === 'CUSTOM' ? { participantId: s.participantId, amount: (parseCents(s.amount) ?? 0) / 100 } : { participantId: s.participantId })),
  }
}
