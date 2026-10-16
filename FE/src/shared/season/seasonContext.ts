import { createContext, useContext, useEffect } from 'react'
import { tripSeason, type Season, type TripDates } from './season'

type SeasonState = { tripSeason: Season | null; setTripSeason: (season: Season | null) => void }
export const SeasonContext = createContext<SeasonState>({ tripSeason: null, setTripSeason: () => {} })

/** Il viaggio aperto decide lo sfondo finché resta a schermo; quando si esce torna la stagione di oggi. */
export function useTripSeason(trip: TripDates | undefined) {
  const { setTripSeason } = useContext(SeasonContext)
  const season = trip ? tripSeason(trip) : null
  useEffect(() => {
    if (!season) return
    setTripSeason(season)
    return () => setTripSeason(null)
  }, [season, setTripSeason])
}
