import { useState } from 'react'
import { Button } from '../../shared/ui/Button'

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
    <div className="card">
      <p className="muted">Codice invito</p>
      <p className="code">{code}</p>
      <Button variant="secondary" onClick={share}>{copied ? 'Copiato!' : 'Condividi codice'}</Button>
    </div>
  )
}
