import { onlineManager, useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, type ReactNode } from 'react'
import { useOnline } from '../../features/pwa/useOnline'
import { apiBlob } from '../api/client'
import { Icon } from './Icon'

type Props = { path: string; alt: string; className?: string; fallback?: ReactNode }   // fallback: cosa mostrare offline senza copia (es. le iniziali)

/** <img> per immagini che richiedono il Bearer: scarica il blob (in cache di TanStack Query) e lo mostra con un object URL. */
export function AuthImage({ path, alt, className = '', fallback }: Props) {
  const online = useOnline()
  // offlineFirst (D-63): anche senza rete si prova, e il service worker risponde con la copia salvata se c'è
  const { data, isError } = useQuery({
    queryKey: ['blob', path], queryFn: () => apiBlob(path), staleTime: Infinity, gcTime: 10 * 60_000,
    networkMode: 'offlineFirst', retry: (failures) => onlineManager.isOnline() && failures < 1,
  })
  const url = useMemo(() => (data ? URL.createObjectURL(data) : undefined), [data])
  useEffect(() => () => { if (url) URL.revokeObjectURL(url) }, [url])
  if (!url && isError && !online && fallback !== undefined) return <span className={className}>{fallback}</span>
  if (!url && isError && !online) {
    return (
      <span className={`img-placeholder img-offline ${className}`} role="img" aria-label={`${alt}: serve la rete`}>
        <Icon name="image_not_supported" /><small>Serve la rete</small>
      </span>
    )
  }
  if (!url) return <span className={`img-placeholder ${className}`} role="img" aria-label={alt} aria-busy="true" />
  return <img src={url} alt={alt} className={className} />
}
