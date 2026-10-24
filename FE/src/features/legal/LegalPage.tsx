import type { ReactNode } from 'react'
import { LEGAL } from './legal'

/** Base delle pagine legali: tutto dentro una card, leggibile sopra lo sfondo stagionale. */
export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <article className="card legal">
      <h1>{title}</h1>
      <p className="muted">Ultimo aggiornamento: {LEGAL.updated}</p>
      {children}
    </article>
  )
}
