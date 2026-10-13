import { useState } from 'react'
import { Icon } from '../../shared/ui/Icon'

export function InviteCodeBox({ code, tripName }: { code: string; tripName: string }) {
  const [copied, setCopied] = useState(false)
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
      <button type="button" className="btn btn-soft btn-sm" onClick={share}>
        <Icon name={copied ? 'check' : 'content_copy'} />{copied ? 'Copiato!' : 'Condividi'}
      </button>
    </div>
  )
}
