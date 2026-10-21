import { useEffect, useId, useRef, type ReactNode } from 'react'

type Props = { open: boolean; title: string; onClose: () => void; children: ReactNode }

export function Modal({ open, title, onClose, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId() // id unico: con più modali nella pagina ognuna ha il suo nome accessibile
  useEffect(() => {
    const dialog = ref.current
    if (!dialog || !open || dialog.open) return
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
    dialog.showModal()
    // chiusa o smontata mentre è aperta: il focus torna a chi l'ha aperta (anche con «Chiudi», non solo con Esc)
    return () => {
      if (dialog.open) dialog.close()
      opener?.focus()
    }
  }, [open])
  return (
    <dialog ref={ref} className="modal" onClose={onClose} aria-labelledby={titleId}>
      <h2 id={titleId}>{title}</h2>
      {children}
    </dialog>
  )
}
