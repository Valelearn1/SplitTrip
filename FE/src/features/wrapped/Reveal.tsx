import { useCallback, useEffect, useState } from 'react'
import type { Wrapped } from '../../shared/api/types'
import { Button } from '../../shared/ui/Button'
import { formatMoney } from '../../shared/utils/format'
import { reduceMotion } from '../../shared/utils/motion'
import { Confetti } from '../games/Confetti'

/** Il numero sale da 0 al totale in 1,2 s; con «Riduci le animazioni» è subito lì. */
function CountUp({ value, currency, onDone }: { value: number; currency: string; onDone: () => void }) {
  const [shown, setShown] = useState(() => (reduceMotion() ? value : 0))
  useEffect(() => {
    if (reduceMotion()) return
    let frame = 0
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 1200)
      setShown(value * (1 - (1 - t) ** 3))
      if (t < 1) frame = requestAnimationFrame(tick)
      else onDone()
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [value, onDone])
  return <strong className="amount-xl wrapped-count">{formatMoney(Math.round(shown * 100) / 100, currency)}</strong>
}

type Props = { data: Wrapped; me: string; colors: readonly string[]; onContinue: () => void }

/** La rivelazione del totale e, per chi ha giocato, com'è andata. Frasi neutre: nessun «sbagliato/a». */
export function Reveal({ data, me, colors, onContinue }: Props) {
  // com'è andata e i coriandoli arrivano a numero fermo: niente spoiler mentre il totale sale
  const [done, setDone] = useState(reduceMotion)
  const finish = useCallback(() => setDone(true), [])
  const { totals, guess, trip } = data
  const money = (n: number) => formatMoney(n, trip.currency)
  const best = guess.others && guess.others.length > 1 ? guess.others[0] : null
  return (
    <section className="card wrapped-reveal">
      <Confetti active={done} colors={colors} />
      <p className="label">Avete speso in tutto</p>
      <CountUp value={totals.groupTotal} currency={trip.currency} onDone={finish} />
      <div role="status" className="wrapped-outcome">
        {!done ? null : guess.mine !== null ? (
          <>
            <p>Hai detto {money(guess.mine)} · scarto di {money(Math.abs(guess.mine - totals.groupTotal))}</p>
            {best && <p className="wrapped-best">{best.participantId === me ? 'Hai indovinato meglio di chiunque!' : `Ha indovinato meglio: ${best.displayName}, a ${money(best.diff)}`}</p>}
          </>
        ) : (
          <p>{guess.played === 0 ? 'Nessuno ha giocato' : guess.played === 1 ? '1 ha giocato' : `${guess.played} hanno giocato`}</p>
        )}
      </div>
      <Button onClick={onContinue}>Guarda i numeri</Button>
    </section>
  )
}
