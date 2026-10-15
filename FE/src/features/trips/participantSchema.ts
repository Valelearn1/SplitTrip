import { z } from 'zod'
import { parseCents } from '../expenses/expenseSchema'

export const participantSchema = z
  .object({
    displayName: z.string().trim().min(2, 'Almeno 2 caratteri').max(40, 'Al massimo 40 caratteri'),
    defaultWeight: z.string().refine((v) => (parseCents(v) ?? 0) > 0, 'Un numero maggiore di zero, es. 1, 2 o 0,5'),
    arrivalDate: z.string(),
    departureDate: z.string(),
  })
  .refine((v) => !v.arrivalDate || !v.departureDate || v.departureDate >= v.arrivalDate, {
    message: "La partenza non può precedere l'arrivo", path: ['departureDate'],
  })

export type ParticipantForm = z.infer<typeof participantSchema>
