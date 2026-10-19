import { useState } from 'react'
import { Link } from 'react-router'
import type { Participant, Trip } from '../../shared/api/types'
import { Icon } from '../../shared/ui/Icon'
import { useOnline } from '../pwa/useOnline'
import { WhoPays } from './WhoPays'

/** La card «Giochi» della panoramica: la ruota a viaggio aperto, il riepilogo a viaggio finito. */
export function GamesCard({ trip, me, canWrite, over }: { trip: Trip; me: Participant; canWrite: boolean; over: boolean }) {
  const [wheel, setWheel] = useState(false)
  const online = useOnline()
  return (
    <div className="card games-card">
      <h2>Giochi</h2>
      <ul className="list">
        {canWrite && (
          <li><button type="button" className="row link-button game-row" disabled={!online} title={online ? undefined : 'Serve la rete'} onClick={() => setWheel(true)}><span><Icon name="casino" />Chi offre?</span><Icon name="chevron_right" /></button></li>
        )}
        <li>
          {over
            ? <Link to="riepilogo" className="row game-row"><span><Icon name="celebration" />Il vostro viaggio in numeri</span><Icon name="chevron_right" /></Link>
            : <span className="row game-row muted"><span><Icon name="celebration" />Il vostro viaggio in numeri</span><small>arriva a fine viaggio</small></span>}
        </li>
      </ul>
      {wheel && <WhoPays trip={trip} me={me} open onClose={() => setWheel(false)} />}
    </div>
  )
}
