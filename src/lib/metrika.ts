import { metrika } from '@/content'

declare global { interface Window { ym?: (...args: unknown[]) => void } }

const local = () => ['localhost', '127.0.0.1'].includes(location.hostname)

/** Цель Метрики: phone, form, calc, messenger, map. Молчит без счётчика и на localhost */
export function goal(name: string, params?: Record<string, unknown>) {
  if (!metrika.id || local()) { if (import.meta.env.DEV) console.info('[goal]', name, params ?? ''); return }
  window.ym?.(metrika.id, 'reachGoal', name, params)
}

export function initMetrika() {
  if (!metrika.id || local() || window.ym) return
  const w = window as Window & { ym: ((...a: unknown[]) => void) & { a?: unknown[]; l?: number } }
  w.ym = w.ym || function (...args: unknown[]) { (w.ym.a = w.ym.a || []).push(args) }
  w.ym.l = Date.now()
  const s = document.createElement('script'); s.async = true; s.src = `https://mc.yandex.ru/metrika/tag.js?id=${metrika.id}`
  document.head.appendChild(s)
  w.ym(metrika.id, 'init', { ssr: true, webvisor: true, clickmap: true, referrer: document.referrer, url: location.href, accurateTrackBounce: true, trackLinks: true })
}
