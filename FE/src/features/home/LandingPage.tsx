import { Link, Navigate } from 'react-router'
import { Icon } from '../../shared/ui/Icon'
import { Logo } from '../../shared/ui/Logo'
import { useAuth } from '../auth/useAuth'

const PILLARS = [
  { icon: 'checklist', title: 'Prima: pianificate insieme', text: 'Liste condivise, meteo della destinazione e consigli per decidere cosa portare e cosa vedere.' },
  { icon: 'receipt_long', title: 'Durante: spese e chat', text: 'Ogni spesa divisa come serve, anche per presenza o per chi conta per due; foto sulla mappa e chat del gruppo.' },
  { icon: 'balance', title: 'Dopo: conti chiari', text: 'Saldi sempre aggiornati e il minimo di rimborsi per tornare in pari, senza fogli di calcolo.' },
]
const STEPS = ['Crea il viaggio e scegli la destinazione', 'Invita il gruppo con un codice', 'Registrate le spese: i conti si fanno da soli']

/** Pagina di presentazione (spec v3.1 §5): chi è loggato va dritto alla Home. */
export function LandingPage() {
  const { auth } = useAuth()
  if (auth) return <Navigate to="/trips" replace />
  return (
    <div className="landing">
      <section className="landing-hero">
        <Logo size={72} />
        <h1>Vacanze in compagnia, conti chiari</h1>
        <p className="muted">Pianificate insieme prima di partire, tenete traccia di spese e cose da fare durante, e ritrovatevi con ricordi condivisi e conti a posto al ritorno.</p>
        <div className="actions">
          <Link to="/register" className="btn btn-primary">Crea un account</Link>
          <Link to="/login" className="btn btn-secondary">Accedi</Link>
        </div>
        <Link to="/login?next=/join" className="link-button">Ho un codice invito</Link>
      </section>
      <section className="landing-pillars">
        {PILLARS.map((p) => (
          <div key={p.title} className="card"><Icon name={p.icon} /><h2>{p.title}</h2><p className="muted">{p.text}</p></div>
        ))}
      </section>
      <section className="card landing-steps">
        <h2>Come funziona</h2>
        <ol>{STEPS.map((s) => <li key={s}>{s}</li>)}</ol>
      </section>
      <footer className="landing-footer muted">
        <strong>Dividete le spese, non le amicizie.</strong>
        Fatto con ☕ da Valentina · <a href="https://github.com/Valelearn1/SplitTrip">codice su GitHub</a>
      </footer>
    </div>
  )
}
