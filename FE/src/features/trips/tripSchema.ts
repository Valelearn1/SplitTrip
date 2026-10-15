import { z } from 'zod'

export const tripSchema = z
  .object({
    name: z.string().trim().min(1, 'Dai un nome al viaggio').max(80, 'Al massimo 80 caratteri'),
    destination: z.string().trim().min(1, 'Dove andate?').max(120, 'Al massimo 120 caratteri'),
    startDate: z.string().min(1, 'Scegli la data di partenza'),
    endDate: z.string().min(1, 'Scegli la data di ritorno'),
    currency: z.string().regex(/^[A-Z]{3}$/, 'Valuta a 3 lettere, es. EUR'),
    // dalla proposta scelta (D-46): o entrambe o nessuna
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  })
  .refine((v) => v.endDate >= v.startDate, { message: 'Il ritorno deve essere dopo la partenza', path: ['endDate'] })

export type TripForm = z.infer<typeof tripSchema>
