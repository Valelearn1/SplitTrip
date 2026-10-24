import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { LEGAL } from './legal'

/** Piè di pagina con copyright e pagine legali (D-72): presentazione e profilo. */
export function LegalFooter({ children }: { children?: ReactNode }) {
  return (
    <footer className="site-footer muted">
      {children}
      <p>© {LEGAL.year} {LEGAL.owner} · <Link to="/termini">Termini e condizioni</Link> · <Link to="/privacy">Privacy</Link></p>
    </footer>
  )
}
