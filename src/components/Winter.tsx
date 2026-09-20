import { useEffect, useRef, useState } from 'react'
import { animate, motion, useInView, useMotionValue, useMotionValueEvent, useReducedMotion, useTransform } from 'motion/react'
import { Smartphone, Clock, Wrench } from 'lucide-react'
import { winter } from '@/content'
import { scrollTo } from '@/lib/lead'
import { Reveal } from './Reveal'

const icons = [Smartphone, Clock, Wrench]

export function Winter() {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-25% 0px' })
  const v = useMotionValue(winter.from)
  const [warm, setWarm] = useState(false)

  useEffect(() => { if (reduce) { v.set(winter.to); setWarm(true) } }, [reduce, v])
  useEffect(() => {
    if (!inView || reduce) return
    const c = animate(v, winter.to, { duration: 2.8, delay: 0.35, ease: [0.35, 0, 0.15, 1] })
    return () => c.stop()
  }, [inView, reduce, v])

  useMotionValueEvent(v, 'change', (n) => setWarm(n > 0))
  const text = useTransform(() => { const n = Math.round(v.get()); return `${n < 0 ? '−' : '+'}${Math.abs(n)}°` })
  const color = useTransform(v, [winter.from, 0, winter.to], ['#a9e6f2', '#ffffff', '#ffc48a'])
  const glow = useTransform(v, [winter.from, winter.to], ['rgba(169,230,242,.22)', 'rgba(255,196,138,.16)'])

  return (
    <section className="section winter" id="autostart">
      <motion.div className="winter__bg" style={{ '--w-glow': glow } as React.CSSProperties} aria-hidden="true" />
      <div className="container winter__grid" ref={ref}>
        <div>
          <motion.div className="temp" style={{ color }} aria-live="polite">{text}</motion.div>
          <div className="temp__labels">
            <i />
            <span>{warm ? <b>{winter.toLabel}</b> : <b>{winter.fromLabel}</b>}</span>
          </div>
        </div>
        <Reveal>
          <p className="eyebrow">{winter.eyebrow}</p>
          <h2 className="h2 winter__title">{winter.title}</h2>
          <p className="winter__text">{winter.text}</p>
          <ul className="winter__list">
            {winter.bullets.map((b, i) => { const I = icons[i]; return <li key={b}><I strokeWidth={1.6} aria-hidden="true" />{b}</li> })}
          </ul>
          <p className="winter__price">{winter.priceLine}</p>
          <button className="btn btn--primary winter__cta" onClick={() => scrollTo('contact')}>{winter.cta}</button>
        </Reveal>
      </div>
    </section>
  )
}
