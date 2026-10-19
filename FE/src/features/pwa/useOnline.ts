import { onlineManager } from '@tanstack/react-query'
import { useSyncExternalStore } from 'react'

/** Lo stato della rete per tutta l'app (D-63): lo stesso che usa TanStack Query per mettere in pausa le richieste. */
export function useOnline(): boolean {
  return useSyncExternalStore((notify) => onlineManager.subscribe(notify), () => onlineManager.isOnline(), () => true)
}
