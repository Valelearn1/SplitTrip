import { expect, it } from 'vitest'
import { installMode, isIos } from './installPrompt'

it('quattro casi: installata, installabile, iPhone, menu del browser', () => {
  expect(installMode({ installed: false, standalone: true, hasPrompt: true, ios: false })).toBe('installed')
  expect(installMode({ installed: true, standalone: false, hasPrompt: false, ios: false })).toBe('installed')
  expect(installMode({ installed: false, standalone: false, hasPrompt: true, ios: false })).toBe('prompt')
  expect(installMode({ installed: false, standalone: false, hasPrompt: false, ios: true })).toBe('ios')
  expect(installMode({ installed: false, standalone: false, hasPrompt: false, ios: false })).toBe('menu')
})

it('riconosce iPhone e anche l\'iPad che si presenta come Mac', () => {
  expect(isIos('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)', 5)).toBe(true)
  expect(isIos('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 5)).toBe(true)
  expect(isIos('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 0)).toBe(false)
  expect(isIos('Mozilla/5.0 (Linux; Android 15)', 5)).toBe(false)
})
