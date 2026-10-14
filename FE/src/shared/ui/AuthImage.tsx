import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo } from 'react'
import { apiBlob } from '../api/client'

type Props = { path: string; alt: string; className?: string }

/** <img> per immagini che richiedono il Bearer: scarica il blob (in cache di TanStack Query) e lo mostra con un object URL. */
export function AuthImage({ path, alt, className = '' }: Props) {
  const { data } = useQuery({ queryKey: ['blob', path], queryFn: () => apiBlob(path), staleTime: Infinity, gcTime: 10 * 60_000 })
  const url = useMemo(() => (data ? URL.createObjectURL(data) : undefined), [data])
  useEffect(() => () => { if (url) URL.revokeObjectURL(url) }, [url])
  if (!url) return <span className={`img-placeholder ${className}`} role="img" aria-label={alt} aria-busy="true" />
  return <img src={url} alt={alt} className={className} />
}
