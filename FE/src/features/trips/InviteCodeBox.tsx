import { useState } from 'react'
import { Button } from '../../shared/ui/Button'
import { Icon } from '../../shared/ui/Icon'
import { Modal } from '../../shared/ui/Modal'
import { InviteQr } from './InviteQr'

export function InviteCodeBox({ code, tripName }: { code: string; tripName: string }) {
  const [copied, setCopied] = useState(false)
  const [showQr, setShowQr] = useState(false)
  const link = `${window.location.origin}/join/${code}`

  async function share() {
    const text = `Entra nel viaggio "${tripName}" su SplitTrip con il codice ${code}: ${link}`
    if (navigator.share) {
      await navigator.share({ title: 'SplitTrip', text }).catch(() => {})
      return
    }
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="invite">
      <span className="invite-label"><Icon name="key" />Codice invito <span className="code">{code}</span></span>
      <span className="invite-actions">
        <button type="button" className="btn btn-soft btn-sm" onClick={() => setShowQr(true)}><Icon name="qr_code_2" />QR</button>
        <button type="button" className="btn btn-soft btn-sm" onClick={share}>
          <Icon name={copied ? 'check' : 'content_copy'} />{copied ? 'Copiato!' : 'Condividi'}
        </button>
      </span>
      {showQr && (
        <Modal open title="Entra nel viaggio" onClose={() => setShowQr(false)}>
          <div className="invite-qr">
            <InviteQr link={link} label={`QR per entrare nel viaggio ${tripName}, codice ${code}`} />
            <span className="code">{code}</span>
            <p className="muted">Inquadra per entrare in «{tripName}»</p>
          </div>
          <div className="modal-actions">
            <Button type="button" variant="secondary" needsNetwork={false} onClick={() => setShowQr(false)}>Chiudi</Button>
          </div>
        </Modal>
      )}
    </div>
  )
}
