type Listener = () => void
const listeners = new Set<Listener>()

/** Una modifica è fallita perché manca la rete: l'avviso breve a schermo (D-63). */
export const networkNotice = {
  notify() { listeners.forEach((l) => l()) },
  subscribe(l: Listener) { listeners.add(l); return () => { listeners.delete(l) } },
}
