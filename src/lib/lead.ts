// Мостик «конструктор → форма»: конструктор кладёт расчёт, форма подхватывает.
type Listener = (text: string) => void
const listeners = new Set<Listener>()
let current = ''
export const lead = {
  set(text: string) { current = text; listeners.forEach((l) => l(text)) },
  get: () => current,
  subscribe(l: Listener) { listeners.add(l); return () => { listeners.delete(l) } },
}
export const scrollTo = (id: string) => {
  const el = document.getElementById(id)
  if (!el) return
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
}
