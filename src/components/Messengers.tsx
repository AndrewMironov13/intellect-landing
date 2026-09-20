import { messengerLinks } from '@/lib/channels'
import { goal } from '@/lib/metrika'

export const MessengerIcon = ({ id }: { id: string }) => {
  if (id === 'telegram') return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21.9 4.6 18.7 19.4c-.2 1-.9 1.3-1.8.8l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.4-5 9.1-8.2c.4-.4-.1-.5-.6-.2L6.2 13.1 1.4 11.6c-1-.3-1-1 .2-1.5L20.5 3c.9-.3 1.6.2 1.4 1.6z"/></svg>
  if (id === 'whatsapp') return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.6.8-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 12 12 0 0 0 4.6 4c1.7.7 2.3.8 3.2.7a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3z"/></svg>
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 21l1.9-5.4A8 8 0 1 1 21 12z"/><path d="M8 12h.01M12 12h.01M16 12h.01"/></svg>
}

export function Messengers({ extra = '', className = '' }: { extra?: string; className?: string }) {
  const links = messengerLinks(extra)
  if (!links.length) return null
  return (
    <div className={`msgs ${className}`.trim()}>
      {links.map((l) => (
        <a key={l.id} className={`msg msg--${l.id}`} href={l.href} target="_blank" rel="noopener" onClick={() => goal('messenger', { which: l.id })}>
          <MessengerIcon id={l.id} /> Написать в {l.label}
        </a>
      ))}
    </div>
  )
}
