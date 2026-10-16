import { render } from '@testing-library/react'
import { expect, it } from 'vitest'
import { GLOBE_LAND } from './globe'
import { Logo } from './Logo'

it('è un SVG decorativo col mappamondo: sfera e continenti, scalabile', () => {
  const { container } = render(<Logo size={40} />)
  const svg = container.querySelector('svg')!
  expect(svg).toHaveAttribute('aria-hidden', 'true')
  expect(svg).toHaveAttribute('width', '40')
  expect(svg.querySelector('circle')).toBeInTheDocument()
  expect(svg.querySelectorAll('[data-land] path')).toHaveLength(GLOBE_LAND.length)   // Europa, Africa, Arabia, Madagascar, Sudamerica
})

it('due loghi nella stessa pagina non condividono gli id di gradienti e ritaglio', () => {
  const { container } = render(<><Logo /><Logo /></>)
  const ids = [...container.querySelectorAll('[id]')].map((el) => el.id)
  expect(ids.length).toBeGreaterThan(0)
  expect(new Set(ids).size).toBe(ids.length)
  const refs = [...container.querySelectorAll('*')].flatMap((el) => ['fill', 'clip-path'].map((a) => el.getAttribute(a)?.match(/^url\(#(.+)\)$/)?.[1]))
    .filter((r) => r !== undefined)
  expect(refs.length).toBe(6)   // oceano, ritaglio, ombra per ciascun logo
  for (const r of refs) expect(ids).toContain(r)
})
