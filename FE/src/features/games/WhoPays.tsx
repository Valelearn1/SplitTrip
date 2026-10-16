import * as m from 'motion/react-m'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import type { Participant, Trip } from '../../shared/api/types'
import { isSoundOn, playChime } from '../../shared/live/sound'
import { Avatar } from '../../shared/ui/Avatar'
import { Button } from '../../shared/ui/Button'
import { Icon } from '../../shared/ui/Icon'
import { Modal } from '../../shared/ui/Modal'
import { localToday } from '../../shared/utils/format'
import { reduceMotion } from '../../shared/utils/motion'
import type { ExpensePrefill } from '../expenses/ExpenseFormPage'
import { Confetti } from './Confetti'
import { tripSeason } from '../../shared/season/season'
import { cryptoRandom, pickIndex, WHEEL_INK, wheelColors, wheelRotation } from './wheel'

type Props = { trip: Trip; me: Participant; open: boolean; onClose: () => void; random?: () => number }

const SPIN_MS = 3000

/** «Chi offre?» (D-52): la ruota sceglie tra chi c'è; il verdetto apre la spesa già compilata. Solo frontend. */
export function WhoPays({ trip, me, open, onClose, random = cryptoRandom }: Props) {
  const navigate = useNavigate()
  // il server manda solo i partecipanti attivi: chi è uscito non c'è già
  const people = trip.participants
  // chi non ha un account di solito non è al tavolo: si spunta a mano
  const [chosen, setChosen] = useState<Set<string>>(() => new Set(people.filter((p) => p.userId !== null).map((p) => p.id)))
  const [rotation, setRotation] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [winner, setWinner] = useState<Participant | null>(null)
  const timer = useRef<number | undefined>(undefined)
  const verdict = useRef<HTMLParagraphElement>(null)
  const players = people.filter((p) => chosen.has(p.id))
  const slice = 360 / Math.max(players.length, 1)
  const colors = wheelColors(tripSeason(trip))

  useEffect(() => () => window.clearTimeout(timer.current), [])
  useEffect(() => { if (winner) verdict.current?.focus() }, [winner])

  function announce(target: Participant) {
    setSpinning(false)
    setWinner(target)
    if (isSoundOn()) playChime()
  }

  function spin() {
    const index = pickIndex(players.length, random)
    const target = players[index]
    setWinner(null)
    if (reduceMotion()) { announce(target); return }
    setSpinning(true)
    setRotation((r) => r - (r % 360) + wheelRotation(index, players.length))
    timer.current = window.setTimeout(() => announce(target), SPIN_MS)
  }

  function register() {
    if (!winner) return
    // offerta vera (D-52): la spesa è solo di chi offre, nessuno deve restituire niente
    const prefill: ExpensePrefill = { payerId: winner.id, participantIds: [winner.id], category: 'FOOD', date: localToday(), description: '' }
    onClose()
    navigate(`/trips/${trip.id}/expenses/new`, { state: { prefill } })
  }

  const toggle = (id: string) => {
    setWinner(null)
    setChosen((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next })
  }

  return (
    <Modal open={open} title="Chi offre?" onClose={onClose}>
      <p className="muted">Spunta chi c'è, poi gira: ognuno ha le stesse probabilità.</p>
      <div className="chips who-chips" role="group" aria-label="Chi c'è">
        {people.map((p) => (
          <label key={p.id} className="chip">
            <input type="checkbox" checked={chosen.has(p.id)} onChange={() => toggle(p.id)} disabled={spinning} aria-label={p.displayName} />
            <Avatar name={p.displayName} size="sm" userId={p.userId ?? undefined} hasAvatar={p.hasAvatar} me={p.id === me.id} />{p.displayName}
          </label>
        ))}
      </div>
      <div className="wheel-wrap">
        <span className="wheel-pointer" aria-hidden="true" />
        <m.svg className="wheel" viewBox="-50 -50 100 100" aria-hidden="true" animate={{ rotate: rotation }}
          transition={{ duration: reduceMotion() ? 0 : SPIN_MS / 1000, ease: [0.15, 0.85, 0.25, 1] }}>
          {players.map((p, i) => {
            const a0 = (i * slice - 90) * (Math.PI / 180), a1 = ((i + 1) * slice - 90) * (Math.PI / 180)
            const d = players.length === 1 ? 'M0,0 m-50,0 a50,50 0 1,0 100,0 a50,50 0 1,0 -100,0'
              : `M0,0 L${50 * Math.cos(a0)},${50 * Math.sin(a0)} A50,50 0 ${slice > 180 ? 1 : 0},1 ${50 * Math.cos(a1)},${50 * Math.sin(a1)} Z`
            const mid = ((i + 0.5) * slice - 90) * (Math.PI / 180)
            const [x, y] = [30 * Math.cos(mid), 30 * Math.sin(mid)]
            return (
              <g key={p.id}>
                <path d={d} fill={colors[i % colors.length]} stroke="var(--surface)" strokeWidth="1" />
                <text x={x} y={y} fontSize="6" fontWeight="700" fill={WHEEL_INK} textAnchor="middle" dominantBaseline="middle"
                  transform={`rotate(${(i + 0.5) * slice} ${x} ${y})`}>{p.displayName.split(' ')[0]}</text>
              </g>
            )
          })}
        </m.svg>
      </div>
      <Confetti active={winner !== null} colors={colors} />
      <p ref={verdict} role="status" className="wheel-verdict" tabIndex={-1}>{winner ? `Offre ${winner.displayName}!` : spinning ? 'La ruota gira…' : ''}</p>
      {winner && <p className="muted wheel-note">La spesa è solo sua: nessuno deve restituire niente.</p>}
      <div className="modal-actions">
        {winner ? (
          <>
            <Button onClick={register}><Icon name="receipt_long" />Registra la spesa</Button>
            <Button variant="secondary" onClick={spin}>Rigira</Button>
          </>
        ) : (
          <Button onClick={spin} disabled={players.length < 2 || spinning} className="wheel-spin">Gira!</Button>
        )}
        <Button variant="secondary" onClick={onClose}>Chiudi</Button>
      </div>
    </Modal>
  )
}
