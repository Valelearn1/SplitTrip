import { useEffect, useState } from 'react'
import { qrPath } from './qrPath'

/** D-67: il QR si calcola nel telefono e uqr arriva solo quando serve. Sempre scuro su bianco, anche nel tema scuro. */
export function InviteQr({ link, label }: { link: string; label: string }) {
  const [data, setData] = useState<boolean[][] | null>(null)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    let alive = true
    import('uqr')
      .then(({ encode }) => { if (alive) setData(encode(link, { ecc: 'M', border: 4 }).data) })
      .catch(() => { if (alive) setFailed(true) })
    return () => { alive = false }
  }, [link])
  if (failed) return <p className="muted">Usa il codice qui sotto</p>
  if (!data) return <div className="qr qr-placeholder" aria-hidden="true" />
  return (
    <svg className="qr" role="img" aria-label={label} viewBox={`0 0 ${data.length} ${data.length}`} shapeRendering="crispEdges">
      <rect width={data.length} height={data.length} fill="#ffffff" />
      <path fill="#141c26" d={qrPath(data)} />
    </svg>
  )
}
