import { useContext } from 'react'
import { localToday } from '../utils/format'
import { seasonOf, type Season } from './season'
import { SeasonContext } from './seasonContext'
import autumnDark from './art/autumn-dark.svg'
import autumnLight from './art/autumn-light.svg'
import springDark from './art/spring-dark.svg'
import springLight from './art/spring-light.svg'
import summerDark from './art/summer-dark.svg'
import summerLight from './art/summer-light.svg'
import winterDark from './art/winter-dark.svg'
import winterLight from './art/winter-light.svg'
import autumnDarkWide from './art/autumn-dark-wide.svg'
import autumnLightWide from './art/autumn-light-wide.svg'
import springDarkWide from './art/spring-dark-wide.svg'
import springLightWide from './art/spring-light-wide.svg'
import summerDarkWide from './art/summer-dark-wide.svg'
import summerLightWide from './art/summer-light-wide.svg'
import winterDarkWide from './art/winter-dark-wide.svg'
import winterLightWide from './art/winter-light-wide.svg'

type Art = { tall: string; wide: string }
// due tagli per tema: verticale per il telefono, orizzontale (fondi ripetuti a specchio) per gli schermi larghi
const ART: Record<Season, { light: Art; dark: Art }> = {
  spring: { light: { tall: springLight, wide: springLightWide }, dark: { tall: springDark, wide: springDarkWide } },
  summer: { light: { tall: summerLight, wide: summerLightWide }, dark: { tall: summerDark, wide: summerDarkWide } },
  autumn: { light: { tall: autumnLight, wide: autumnLightWide }, dark: { tall: autumnDark, wide: autumnDarkWide } },
  winter: { light: { tall: winterLight, wide: winterLightWide }, dark: { tall: winterDark, wide: winterDarkWide } },
}

function Picture({ art, className }: { art: Art; className: string }) {
  return (
    <picture className={className}>
      <source media="(min-width: 720px)" srcSet={art.wide} />
      <img className="season-art" src={art.tall} alt="" loading="lazy" decoding="async" />
    </picture>
  )
}

/** D-58: l'illustrazione della stagione dietro l'app. Decorativa; il CSS mostra la versione del tema attivo. */
export function SeasonBackground({ today }: { today?: string }) {
  const { tripSeason } = useContext(SeasonContext)
  const season = tripSeason ?? seasonOf(today ?? localToday())
  return (
    <div className="season-bg" data-season={season} aria-hidden="true">
      <Picture art={ART[season].light} className="season-light" />
      <Picture art={ART[season].dark} className="season-dark" />
    </div>
  )
}
