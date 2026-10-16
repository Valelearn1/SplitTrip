import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router'

/**
 * Torna da dove si è venuti; se la pagina è la prima della cronologia dell'app (link diretto, ricarica)
 * va a `fallback` sostituendo la voce: «Indietro» non deve mai riaprire un modulo già salvato.
 */
export function useGoBack() {
  const location = useLocation()
  const navigate = useNavigate()
  return useCallback((fallback: string) => {
    // la prima voce della cronologia dell'app ha key 'default': prima di lei c'è un altro sito, o niente
    if (location.key === 'default') navigate(fallback, { replace: true })
    else navigate(-1)
  }, [location.key, navigate])
}
