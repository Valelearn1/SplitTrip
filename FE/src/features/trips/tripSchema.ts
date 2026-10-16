import { z } from 'zod'

const tripFields = z.object({
  name: z.string().trim().min(1, 'Dai un nome al viaggio').max(80, 'Al massimo 80 caratteri'),
  destination: z.string().trim().min(1, 'Dove andate?').max(120, 'Al massimo 120 caratteri'),
  startDate: z.string().min(1, 'Scegli la data di partenza'),
  endDate: z.string().min(1, 'Scegli la data di ritorno'),
  currency: z.string().regex(/^[A-Z]{3}$/, 'Valuta a 3 lettere, es. EUR'),
  // dalla proposta scelta (D-46): o entrambe o nessuna
  latitude: z.number().optional(),
  longitude: z.number().optional(),
})

type TripValues = z.infer<typeof tripFields>
const datesInOrder = (v: TripValues) => v.endDate >= v.startDate
const placeChosen = (v: TripValues) => v.latitude !== undefined && v.longitude !== undefined
const DATES = { message: 'Il ritorno deve essere dopo la partenza', path: ['endDate'] }
const PLACE = { message: "Scegli la destinazione dall'elenco", path: ['destination'] }

/** Nuovo viaggio: la destinazione è sempre una proposta scelta, con le sue coordinate (D-60). */
export const tripSchema = tripFields.refine(datesInOrder, DATES).refine(placeChosen, PLACE)

/** Impostazioni: la proposta serve solo se la destinazione cambia (un viaggio vecchio senza coordinate resta modificabile). */
export function tripSettingsSchema(currentDestination: string) {
  return tripFields.refine(datesInOrder, DATES).refine((v) => v.destination.trim() === currentDestination.trim() || placeChosen(v), PLACE)
}

export type TripForm = TripValues
