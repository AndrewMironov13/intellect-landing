import { useEffect, useRef, useState } from 'react'
import { animate, motion, useMotionValue, useMotionValueEvent, useReducedMotion, useSpring, useTransform } from 'motion/react'
import { ArrowRight, Phone } from 'lucide-react'
import { brand, winter, type ServicePage } from '@/content'
import { asset, photo } from '@/lib/asset'
import { scrollTo } from '@/lib/lead'
import { goal } from '@/lib/metrika'
import { HexLattice } from './HexLattice'
import { lateStart } from '@/lib/late'

const EASE = [0.2, 0.7, 0.2, 1] as const

/** Для автозапуска вместо фото — температура, которая теплеет от −18 до +22 */
function HeroTemp() {
  const reduce = useReducedMotion() || lateStart
  const v = useMotionValue(reduce ? winter.to : winter.from)
  const [warm, setWarm] = useState(!!reduce)
  useEffect(() => {
    if (reduce) return
    const c = animate(v, winter.to, { duration: 2.8, delay: 1.1, ease: [0.35, 0, 0.15, 1] })
    return () => c.stop()
  }, [reduce, v])
  useMotionValueEvent(v, 'change', (n) => setWarm(n > 0))
  const text = useTransform(() => { const n = Math.round(v.get()); return `${n < 0 ? '−' : '+'}${Math.abs(n)}°` })
  const color = useTransform(v, [winter.from, 0, winter.to], ['#a9e6f2', '#ffffff', '#ffc48a'])
  const glow = useTransform(v, [winter.from, winter.to], ['rgba(169,230,242,.26)', 'rgba(255,196,138,.2)'])
  return (
    <div className="hero__temp" aria-hidden="true">
      <motion.div className="hero__temp-glow" style={{ '--w-glow': glow } as React.CSSProperties} />
      <motion.div className="temp" style={{ color }}>{text}</motion.div>
      <div className="temp__labels"><i /><span><b>{warm ? winter.toLabel : winter.fromLabel}</b></span></div>
    </div>
  )
}

export function ServiceHero({ page }: { page: ServicePage }) {
  const reduce = useReducedMotion()
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
  const still = reduce || lateStart

  const lines = { hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.4 } } }
  const line = { hidden: { y: '112%' }, show: { y: '0%', transition: { duration: 1, ease: EASE } } }
  const fade = (delay: number) => ({
    initial: still ? false : { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.9, delay, ease: EASE },
  })
  const last = page.h1Lines.length - 1

  return (
    <section className={`hero hero--svc${page.hero.winter ? ' hero--winter' : ''}`} id="top" ref={host} onPointerMove={onMove} onPointerLeave={onLeave}>
      {page.hero.photo ? (
        <motion.div className="hero__photo" initial={still ? false : { opacity: 0, scale: 1.08 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.8, ease: EASE }}>
          <motion.img src={photo(page.hero.photo)} alt={page.hero.alt} style={{ x: tx, y: ty, scale: 1.05, objectPosition: page.hero.pos }} fetchPriority="high" decoding="async" />
        </motion.div>
      ) : <HeroTemp />}
      <div className="hero__lattice"><HexLattice hostRef={host} /></div>

      <div className="container hero__body">
        <motion.nav className="crumbs" aria-label="Хлебные крошки" {...fade(0.1)}>
          <a href={asset('')}>Главная</a><span>/</span><a href={asset('#services')}>Услуги</a><span>/</span><span aria-current="page">{page.nav}</span>
        </motion.nav>
        <motion.p className="eyebrow hero__eyebrow" {...fade(0.2)}>{page.eyebrow}</motion.p>
        <motion.h1 className="h1 h1--svc" variants={lines} initial={still ? 'show' : 'hidden'} animate="show">
          {page.h1Lines.map((l, i) => (
            <span className="line" key={l}><motion.span variants={line} className={i === last ? 'h1__accent' : undefined}>{l}{i < last ? ' ' : ''}</motion.span></span>
          ))}
        </motion.h1>
        <motion.p className="hero__lead" {...fade(0.95)}>{page.lead}</motion.p>
        <motion.div className="hero__cta" {...fade(1.1)}>
          <button className="btn btn--primary" onClick={() => scrollTo(page.primary.target)}>{page.primary.label} <ArrowRight /></button>
          <a className="btn btn--ghost" href={brand.phoneHref} onClick={() => goal('phone', { where: `hero-${page.slug}` })}><Phone /> {brand.phone}</a>
        </motion.div>
      </div>

      <motion.div className="container hero__facts" {...fade(1.3)}>
        {page.facts.map((f) => (
          <div className="fact" key={f.value}>
            <span className={`fact__v${f.star ? ' star' : ''}`}>{f.value}</span>
            <span className="fact__l">{f.label}</span>
          </div>
        ))}
      </motion.div>
    </section>
  )
}
