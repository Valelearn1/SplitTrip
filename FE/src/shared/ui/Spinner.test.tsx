import { act, render, screen } from '@testing-library/react'
import { onlineManager } from '@tanstack/react-query'
import { expect, it } from 'vitest'
import { Spinner } from './Spinner'

it('online carica; offline dice che la pagina non è ancora salvata invece di girare per sempre', () => {
  render(<Spinner />)
  expect(screen.getByRole('status')).toHaveTextContent('Caricamento…')
  act(() => onlineManager.setOnline(false))
  expect(screen.getByRole('status')).toHaveTextContent('Questa pagina non è ancora salvata sul telefono: aprila una volta con la rete.')
})
