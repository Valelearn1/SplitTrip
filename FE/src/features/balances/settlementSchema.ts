import { z } from 'zod'
import { checkMoney } from '../expenses/expenseSchema'

/** «Salda» (D-69): `currency` è quella di quello che passa di mano (di base la valuta del viaggio), `perUnit` il cambio come «177,82». */
export const settlementSchema = (tripCurrency: string) => z
  .object({
    fromParticipantId: z.string().min(1, 'Chi restituisce?'),
    toParticipantId: z.string().min(1, 'Chi riceve?'),
    amount: z.string(),
    currency: z.string().length(3).optional(),
    perUnit: z.string().optional(),
    date: z.string().min(1, 'Scegli una data'),
    note: z.string().max(200, 'Al massimo 200 caratteri').optional(),
  })
  .superRefine((v, ctx) => {
    checkMoney(ctx, { amount: v.amount, currency: v.currency ?? tripCurrency, perUnit: v.perUnit }, tripCurrency)
    if (v.fromParticipantId === v.toParticipantId) ctx.addIssue({ code: 'custom', path: ['toParticipantId'], message: 'Devono essere due persone diverse' })
  })

export type SettlementForm = z.infer<ReturnType<typeof settlementSchema>>
