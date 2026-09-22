import { useRef } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import { hero } from '@/content'
import { photo } from '@/lib/asset'
import { scrollTo } from '@/lib/lead'
import { HexLattice } from './HexLattice'

const EASE = [0.2, 0.7, 0.2, 1] as const

export function Hero() {
  const reduce = useReducedMotion()
  // отладочная ручка ?hero=genesis — примерить другое фото без правки контента
  const qs = new URLSearchParams(location.search)
  const heroPhoto = qs.get('hero') || hero.photo
  const host = useRef<HTMLElement>(null)
  const mx = useMotionValue(0), my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 50, damping: 18, mass: 0.6 })
  const sy = useSpring(my, { stiffness: 50, damping: 18, mass: 0.6 })
  const tx = useTransform(sx, [-1, 1], [-14, 14])
  const ty = useTransform(sy, [-1, 1], [-10, 10])

  const onMove = (e: React.PointerEvent) => {
    if (reduce || e.pointerType !== 'mouse') return
    const r = e.currentTarget.getBoundingClientRect()
    mx.set(((e.clientX - r.left) / r.width - 0.5) * 2)
    my.set(((e.clientY - r.top) / r.height - 0.5) * 2)
  }
  const onLeave = () => { mx.set(0); my.set(0) }

  const lines = { hidden: {}, show: { transition: { staggerChildren: 0.13, delayChildren: 0.45 } } }
  const line = { hidden: { y: '112%' }, show: { y: '0%', transition: { duration: 1, ease: EASE } } }
  const fade = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.9, delay, ease: EASE },
  })

  return (
    <section className="hero" id="top" ref={host} onPointerMove={onMove} onPointerLeave={onLeave}>
      <motion.div className="hero__photo" initial={reduce ? false : { opacity: 0, scale: 1.08 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.8, ease: EASE }}>
        <motion.img src={photo(heroPhoto)} alt={hero.photoAlt} style={{ x: tx, y: ty, scale: 1.05 }} fetchPriority="high" decoding="async" />
      </motion.div>
      <div className="hero__lattice"><HexLattice hostRef={host} /></div>

      <div className="container hero__body">
        <motion.p className="eyebrow hero__eyebrow" {...fade(0.25)}>{hero.eyebrow}</motion.p>
        <motion.h1 className="h1 h1--a" variants={lines} initial={reduce ? 'show' : 'hidden'} animate="show">
          {hero.words.map((w, i) => (
            <span className="line" key={w}><motion.span variants={line} className={i === 2 ? 'h1__accent' : undefined}>{w}{i < hero.words.length - 1 ? ' ' : ''}</motion.span></span>
          ))}
        </motion.h1>
        <motion.p className="hero__lead" {...fade(1.0)}><b>{hero.leadA}</b> {hero.leadA2}</motion.p>
        <motion.div className="hero__cta" {...fade(1.15)}>
          <button className="btn btn--primary" onClick={() => scrollTo('constructor')}>{hero.primary} <ArrowRight /></button>
          <button className="btn btn--ghost" onClick={() => scrollTo('contact')}>{hero.secondary}</button>
        </motion.div>
      </div>

      <motion.div className="container hero__facts" {...fade(1.4)}>
        {hero.facts.map((f, i) => (
          <div className="fact" key={f.value}>
            <span className={`fact__v${i === 0 ? ' star' : ''}`}>{f.value}</span>
            <span className="fact__l">{f.label}</span>
          </div>
        ))}
      </motion.div>
    </section>
  )
}
