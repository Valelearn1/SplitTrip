/** Icona Material Symbols (nome della ligatura). Decorativa di default: aria-hidden. */
export function Icon({ name, fill = false, className = '', label }: { name: string; fill?: boolean; className?: string; label?: string }) {
  return (
    <span className={`msi ${fill ? 'msi-fill' : ''} ${className}`} aria-hidden={label ? undefined : true} aria-label={label} role={label ? 'img' : undefined}>
      {name}
    </span>
  )
}
