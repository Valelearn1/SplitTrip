export type Season = 'spring' | 'summer' | 'autumn' | 'winter'
export type TripDates = { startDate: string; endDate: string; latitude: number | null }

// stagioni meteorologiche dell'emisfero nord, un mese per voce (gennaio → inverno)
const NORTH: Season[] = ['winter', 'winter', 'spring', 'spring', 'spring', 'summer', 'summer', 'summer', 'autumn', 'autumn', 'autumn', 'winter']
const OPPOSITE: Record<Season, Season> = { spring: 'autumn', summer: 'winter', autumn: 'spring', winter: 'summer' }

/** D-58: la stagione di una data ISO; sotto l'equatore si inverte (Sydney a dicembre è estate). */
export function seasonOf(isoDate: string, latitude?: number | null): Season {
  const season = NORTH[Number(isoDate.slice(5, 7)) - 1]
  return latitude != null && latitude < 0 ? OPPOSITE[season] : season
}

/** La stagione del viaggio è quella del giorno a metà: un viaggio a cavallo di due stagioni prende la prevalente. */
export function tripSeason(trip: TripDates): Season {
  const start = Date.parse(trip.startDate)
  const middle = new Date(start + (Date.parse(trip.endDate) - start) / 2).toISOString().slice(0, 10)
  return seasonOf(middle, trip.latitude)
}
