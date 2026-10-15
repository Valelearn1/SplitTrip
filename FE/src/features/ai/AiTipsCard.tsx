import type { AiTipCategory } from '../../shared/api/types'
import { Button } from '../../shared/ui/Button'
import { FormError } from '../../shared/ui/FormError'
import { Icon } from '../../shared/ui/Icon'
import { useAiTips, useGenerateTips } from './useAi'

const categories: Record<AiTipCategory, { icon: string; label: string }> = {
  SEE: { icon: 'photo_camera', label: 'Da vedere' },
  EAT: { icon: 'restaurant', label: 'Da mangiare' },
  PACK: { icon: 'luggage', label: 'Da portare' },
  TIP: { icon: 'lightbulb', label: 'Consiglio' },
}

/** D-41: consigli generati con AI, solo se il server ha la chiave; sempre dichiarati come tali. */
export function AiTipsCard({ tripId, destination, canWrite }: { tripId: string; destination: string; canWrite: boolean }) {
  const { data } = useAiTips(tripId)
  const generate = useGenerateTips(tripId)
  if (!data?.available) return null
  const hasTips = data.tips.length > 0
  return (
    <section className="card span-2 ai-card" aria-labelledby="ai-title">
      <h2 id="ai-title"><Icon name="auto_awesome" className="inline-icon" /> Consigli per {destination}</h2>
      {generate.isPending ? (
        <div role="status" className="ai-loading"><p className="muted">Sto pensando…</p>{[0, 1, 2].map((i) => <span key={i} className="skeleton-line" />)}</div>
      ) : hasTips ? (
        <ul className="ai-tips">
          {data.tips.map((t) => (
            <li key={t.title}>
              <Icon name={categories[t.category].icon} />
              <div><small className="muted">{categories[t.category].label}</small><strong>{t.title}</strong><p>{t.text}</p></div>
            </li>
          ))}
        </ul>
      ) : <p className="muted">Idee su cosa vedere, mangiare e portare, pensate per le date e il meteo del viaggio.</p>}
      <FormError error={generate.error} />
      {canWrite && (
        <Button variant="soft" className="btn-sm" loading={generate.isPending} disabled={data.remainingToday === 0} onClick={() => generate.mutate()}>
          <Icon name="auto_awesome" />{hasTips ? `Rigenera (${data.remainingToday} rimaste oggi)` : 'Genera consigli'}
        </Button>
      )}
      {hasTips && <small className="muted">Generato con AI · può contenere errori</small>}
    </section>
  )
}
