import { useEffect, useId, useRef, type ReactNode } from 'react'

type Props = { open: boolean; title: string; onClose: () => void; children: ReactNode }

export function Modal({ open, title, onClose, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId() // id unico: con più modali nella pagina ognuna ha il suo nome accessibile
  const closingOurselves = useRef(false)   // la chiusura fatta dal cleanup non è una chiusura dell'utente
  useEffect(() => {
    const dialog = ref.current
    if (!dialog || !open || dialog.open) return
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
    dialog.showModal()
    // chiusa o smontata mentre è aperta: il focus torna a chi l'ha aperta (anche con «Chiudi», non solo con Esc)
    // In StrictMode (sviluppo) l'effetto gira due volte: la chiusura del cleanup non deve arrivare a onClose,
    // altrimenti ogni finestra si richiude appena aperta
    return () => {
      if (dialog.open) { closingOurselves.current = true; dialog.close() }
      opener?.focus()
    }
  }, [open])
  return (
    <dialog ref={ref} className="modal" aria-labelledby={titleId}
      onClose={() => { if (closingOurselves.current) { closingOurselves.current = false; return } onClose() }}>
      <h2 id={titleId}>{title}</h2>
      {children}
    </dialog>
  )
}
