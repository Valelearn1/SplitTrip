import { useId } from 'react'
import { GLOBE_COLORS, GLOBE_LAND } from './globe'

/** Il logo (D-58): mappamondo con oceano blu e continenti verdi, vista su Europa e Africa. Decorativo: il nome è nel testo accanto. */
export function Logo({ size = 24, className = '' }: { size?: number; className?: string }) {
  // id unici per istanza: intestazione e landing mostrano due loghi nella stessa pagina
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const [ocean, shade, clip] = [`${uid}-ocean`, `${uid}-shade`, `${uid}-clip`]
  return (
    <svg className={`logo ${className}`} viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <defs>
        <radialGradient id={ocean} cx="0.38" cy="0.32" r="0.8">
          <stop offset="0" stopColor={GLOBE_COLORS.oceanLight} />
          <stop offset="1" stopColor={GLOBE_COLORS.oceanDeep} />
        </radialGradient>
        <radialGradient id={shade} cx="0.35" cy="0.3" r="0.85">
          <stop offset="0.6" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.22" />
        </radialGradient>
        <clipPath id={clip}><circle cx="12" cy="12" r="11" /></clipPath>
      </defs>
      <circle cx="12" cy="12" r="11" fill={`url(#${ocean})`} />
      <g data-land clipPath={`url(#${clip})`} fill={GLOBE_COLORS.land}>
        {GLOBE_LAND.map((d) => <path key={d} d={d} />)}
      </g>
      <circle cx="12" cy="12" r="11" fill={`url(#${shade})`} />
      <ellipse cx="8.2" cy="6.6" rx="3.6" ry="2.2" fill="#fff" opacity="0.28" transform="rotate(-30 8.2 6.6)" />
    </svg>
  )
}
