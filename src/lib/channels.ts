import { channels } from '@/content'

export type Channel = { id: 'telegram' | 'whatsapp' | 'max'; label: string; href: string }

/** Ссылки на мессенджеры с готовым первым сообщением — метка «я с сайта» стоит в тексте */
export function messengerLinks(extra = ''): Channel[] {
  const text = (channels.prefill + extra).trim()
  const t = encodeURIComponent(text)
  const out: Channel[] = []
  if (channels.max) {
    // В Max предзаполнить текст в личном чате нельзя, ссылка просто открывает диалог
    out.push({ id: 'max', label: 'Max', href: channels.max })
  }
  if (channels.telegram) {
    const u = channels.telegram.replace(/^https?:\/\/t\.me\//, '').replace(/^@/, '').replace(/\/.*$/, '')
    out.push({ id: 'telegram', label: 'Telegram', href: `https://t.me/${u}?text=${t}` })
  }
  if (channels.whatsapp) {
    out.push({ id: 'whatsapp', label: 'WhatsApp', href: `https://wa.me/${channels.whatsapp.replace(/\D/g, '')}?text=${t}` })
  }
  return out
}
