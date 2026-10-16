import { useMemo, useState, type ReactNode } from 'react'
import type { Season } from './season'
import { SeasonContext } from './seasonContext'

export function SeasonProvider({ children }: { children: ReactNode }) {
  const [tripSeason, setTripSeason] = useState<Season | null>(null)
  const value = useMemo(() => ({ tripSeason, setTripSeason }), [tripSeason])
  return <SeasonContext value={value}>{children}</SeasonContext>
}
