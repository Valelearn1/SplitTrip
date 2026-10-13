import { z } from 'zod'
import { parseCents } from '../expenses/expenseSchema'

export const settlementSchema = z
  .object({
    fromUserId: z.string().min(1, 'Chi restituisce?'),
    toUserId: z.string().min(1, 'Chi riceve?'),
    amount: z.string().refine((v) => (parseCents(v) ?? 0) > 0, 'Inserisci un importo maggiore di zero'),
    date: z.string().min(1, 'Scegli una data'),
    note: z.string().max(200, 'Al massimo 200 caratteri').optional(),
  })
  .refine((v) => v.fromUserId !== v.toUserId, { message: 'Devono essere due persone diverse', path: ['toUserId'] })

export type SettlementForm = z.infer<typeof settlementSchema>
