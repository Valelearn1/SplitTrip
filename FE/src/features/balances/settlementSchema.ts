import { z } from 'zod'
import { amountSchema } from '../expenses/expenseSchema'

export const settlementSchema = z
  .object({
    fromParticipantId: z.string().min(1, 'Chi restituisce?'),
    toParticipantId: z.string().min(1, 'Chi riceve?'),
    amount: amountSchema,
    date: z.string().min(1, 'Scegli una data'),
    note: z.string().max(200, 'Al massimo 200 caratteri').optional(),
  })
  .refine((v) => v.fromParticipantId !== v.toParticipantId, { message: 'Devono essere due persone diverse', path: ['toParticipantId'] })

export type SettlementForm = z.infer<typeof settlementSchema>
