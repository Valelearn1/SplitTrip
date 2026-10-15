import { useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { Button } from '../../shared/ui/Button'
import { Icon } from '../../shared/ui/Icon'

type Props = { onSend: (content: string) => Promise<unknown>; onTyping: () => void; sending: boolean }

export function ChatComposer({ onSend, onTyping, sending }: Props) {
  const [text, setText] = useState('')
  const lastTyping = useRef(0)
  const trimmed = text.trim()

  async function submit(e?: FormEvent) {
    e?.preventDefault()
    if (!trimmed || trimmed.length > 1000) return
    await onSend(trimmed)
    setText('')
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    // su desktop Invio invia, Maiusc+Invio va a capo; sul telefono Invio va sempre a capo
    const coarse = window.matchMedia?.('(pointer: coarse)').matches
    if (e.key === 'Enter' && !e.shiftKey && !coarse) void submit(e)
  }

  function change(value: string) {
    setText(value)
    const now = Date.now()
    if (now - lastTyping.current > 2000) {
      lastTyping.current = now
      onTyping()
    }
  }

  return (
    <form className="chat-composer" onSubmit={submit}>
      <label className="sr-only" htmlFor="chat-input">Scrivi un messaggio</label>
      <textarea id="chat-input" rows={1} maxLength={1000} value={text} onKeyDown={onKeyDown} onChange={(e) => change(e.target.value)} placeholder="Scrivi un messaggio" />
      {text.length >= 900 && <small className="muted chat-counter">{text.length}/1000</small>}
      <Button type="submit" loading={sending} disabled={!trimmed}><Icon name="send" />Invia</Button>
    </form>
  )
}
