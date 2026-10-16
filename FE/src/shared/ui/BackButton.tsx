import { useLocation } from 'react-router'
import { parentOf } from '../navigation/backTarget'
import { useGoBack } from '../navigation/useGoBack'
import { Icon } from './Icon'

/** «Indietro»: la pagina precedente dell'app se c'è, altrimenti la pagina madre (link diretto o ricarica). */
export function BackButton({ className = '' }: { className?: string }) {
  const { pathname } = useLocation()
  const goBack = useGoBack()
  return (
    <button type="button" className={`btn btn-secondary btn-sm back-btn ${className}`} onClick={() => goBack(parentOf(pathname))}>
      <Icon name="arrow_back" />Indietro
    </button>
  )
}
