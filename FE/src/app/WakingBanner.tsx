import { useIsFetching, useIsMutating } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Suitcase } from '../shared/ui/illustrations/Suitcase'

/** Dopo 5 s di attesa avvisa che il backend (piano free di Render) si sta svegliando. */
export function WakingBanner() {
  const busy = useIsFetching() + useIsMutating() > 0
  const [slow, setSlow] = useState(false)
  useEffect(() => {
    if (!busy) return
    const t = setTimeout(() => setSlow(true), 5000)
    return () => {
      clearTimeout(t)
      setSlow(false)
    }
  }, [busy])
  if (!slow) return null
  return (
    <div className="waking" role="status">
      <Suitcase bouncing size={20} />
      <span>Il server si sta svegliando, qualche secondo di pazienza…</span>
    </div>
  )
}
