import type { KeyboardEvent } from 'react'
import { useOutletContext, useSearchParams } from 'react-router'
import type { TripContext } from './TripLayout'
import { MeTab } from './settings/MeTab'
import { PeopleTab } from './settings/PeopleTab'
import { TripTab } from './settings/TripTab'

const TABS = [{ id: 'viaggio', label: 'Viaggio' }, { id: 'persone', label: 'Persone' }, { id: 'io', label: 'Io' }] as const
type TabId = (typeof TABS)[number]['id']

/** Impostazioni a tre schede (D-50): ognuna una cosa sola; la scheda sta nell'URL. */
export function TripSettingsPage() {
  const ctx = useOutletContext<TripContext>()
  const [params, setParams] = useSearchParams()
  const fallback: TabId = ctx.isOrganizer ? 'viaggio' : 'persone'
  const raw = params.get('tab')
  const tab: TabId = TABS.find((t) => t.id === raw)?.id ?? fallback

  function go(id: TabId) {
    setParams({ tab: id }, { replace: true })
    document.getElementById(`tab-${id}`)?.focus()
  }

  // schema ARIA delle tab: frecce, Home e Fine spostano la scheda attiva
  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const i = TABS.findIndex((t) => t.id === tab)
    const to = e.key === 'ArrowRight' ? (i + 1) % TABS.length : e.key === 'ArrowLeft' ? (i - 1 + TABS.length) % TABS.length
      : e.key === 'Home' ? 0 : e.key === 'End' ? TABS.length - 1 : null
    if (to === null) return
    e.preventDefault()
    go(TABS[to].id)
  }

  return (
    <div className="stack">
      <div className="settings-tabs" role="tablist" aria-label="Impostazioni del viaggio" onKeyDown={onKeyDown}>
        {TABS.map((t) => (
          <button key={t.id} type="button" role="tab" id={`tab-${t.id}`} aria-selected={tab === t.id} aria-controls={`panel-${t.id}`}
            tabIndex={tab === t.id ? 0 : -1} className={tab === t.id ? 'active' : undefined} onClick={() => go(t.id)}>{t.label}</button>
        ))}
      </div>
      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
        {tab === 'viaggio' && <TripTab {...ctx} />}
        {tab === 'persone' && <PeopleTab {...ctx} />}
        {tab === 'io' && <MeTab {...ctx} />}
      </div>
    </div>
  )
}
