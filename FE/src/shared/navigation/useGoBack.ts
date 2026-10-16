import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router'

/**
 * C'è una pagina dell'app prima di questa? Il router del browser salva in `history.state.idx` la posizione
 * nella cronologia dell'app: 0 è la prima pagina della scheda anche se è stata sostituita (login, invito, cambio
 * di scheda), mentre la sua `key` non è più 'default'. Il router in memoria dei test non ha `idx`: lì vale la `key`.
 */
function hasAppHistory(key: string): boolean {
  const idx = (window.history.state as { idx?: unknown } | null)?.idx
  return typeof idx === 'number' ? idx > 0 : key !== 'default'
}

/**
 * Torna da dove si è venuti; se questa è la prima pagina dell'app (link diretto, ricarica, invito)
 * va a `fallback` sostituendo la voce: «Indietro» non esce mai dall'app e non riapre un modulo già salvato.
 */
export function useGoBack() {
  const location = useLocation()
  const navigate = useNavigate()
  return useCallback((fallback: string) => {
    if (hasAppHistory(location.key)) navigate(-1)
    else navigate(fallback, { replace: true })
  }, [location.key, navigate])
}
