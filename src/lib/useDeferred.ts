import { useEffect, useState } from 'react'

// Картинки ниже первого экрана подгружаем по первой прокрутке (или через 3,5 с),
// чтобы они декодировались пока человек читает hero, а не в момент входа в галерею.
let armed = false
let ready = false
const subs = new Set<() => void>()
function arm() {
  if (armed) return
  armed = true
  const go = () => { if (ready) return; ready = true; subs.forEach((s) => s()) }
  window.addEventListener('scroll', go, { once: true, passive: true })
  window.addEventListener('pointerdown', go, { once: true })
  window.setTimeout(go, 3500)
}
export function useDeferred() {
  const [r, setR] = useState(ready)
  useEffect(() => {
    if (ready) { setR(true); return }
    arm()
    const s = () => setR(true)
    subs.add(s)
    return () => { subs.delete(s) }
  }, [])
  return r
}
