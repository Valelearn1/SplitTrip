import { render } from '@testing-library/react'
import { expect, it } from 'vitest'
import { expectAccessible } from './a11y'

it('il controllo trova davvero i problemi: un bottone senza nome e un campo senza etichetta', async () => {
  render(<form><button type="button"><svg /></button><input type="text" /></form>)
  await expect(expectAccessible()).rejects.toThrow(/button-name|label/)
})
