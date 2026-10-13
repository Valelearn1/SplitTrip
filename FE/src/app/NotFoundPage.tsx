import { Link } from 'react-router'

export function NotFoundPage() {
  return (
    <section>
      <h1>Pagina non trovata</h1>
      <Link to="/trips">Torna ai viaggi</Link>
    </section>
  )
}
