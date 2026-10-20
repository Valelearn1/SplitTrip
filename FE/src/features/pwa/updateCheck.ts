/** Cerca una versione nuova solo con la rete; un errore (rete caduta a metà) non resta senza gestione (D-63). */
export function checkForUpdate(registration: { update(): Promise<unknown> }, online: boolean = navigator.onLine) {
  if (online) registration.update().catch(() => {})
}
