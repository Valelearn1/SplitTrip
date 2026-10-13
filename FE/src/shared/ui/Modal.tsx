import { useEffect, useRef, type ReactNode } from 'react'

type Props = { open: boolean; title: string; onClose: () => void; children: ReactNode }

export function Modal({ open, title, onClose, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])
  return (
    <dialog ref={ref} className="modal" onClose={onClose} aria-labelledby="modal-title">
      <h2 id="modal-title">{title}</h2>
      {children}
    </dialog>
  )
}
