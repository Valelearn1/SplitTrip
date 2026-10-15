import { MotionConfig } from 'motion/react'
import { useLayoutEffect, type ReactNode } from 'react'
import { useAuth } from '../features/auth/useAuth'

/**
 * D-43 + D-48: animazioni spente se lo chiede il sistema oppure la preferenza dell'account.
 * Motion la riceve da MotionConfig; CSS e mappe la leggono dall'attributo su <html>.
 */
export function MotionRoot({ children }: { children: ReactNode }) {
  const { auth } = useAuth()
  const reduce = auth?.user.reduceMotion ?? false
  useLayoutEffect(() => { document.documentElement.dataset.reduceMotion = String(reduce) }, [reduce])
  return <MotionConfig reducedMotion={reduce ? 'always' : 'user'}>{children}</MotionConfig>
}
