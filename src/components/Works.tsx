import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { works } from '@/content'
import { photo } from '@/lib/asset'
import { Reveal } from './Reveal'
import { useDeferred } from '@/lib/useDeferred'

const EASE = [0.2, 0.7, 0.2, 1] as const

export function Works() {
  const reduce = useReducedMotion()
  const [open, setOpen] = useState<number | null>(null)
  const ready = useDeferred()
  useEffect(() => {
    if (open === null) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(null) }
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <section className="section" id="works">
      <div className="container">
        <Reveal>
          <div className="head head--split">
            <div>
              <p className="eyebrow">Работы</p>
              <h2 className="h2" style={{ marginTop: 16 }}>Из нашего бокса</h2>
            </div>
            <p className="lead">Машины наших клиентов в боксе на Переходникова, 27Г</p>
          </div>
        </Reveal>
        <motion.div className="works-grid" initial={reduce ? 'show' : 'hidden'} whileInView="show" viewport={{ once: true, margin: '0px 0px -100px 0px' }} variants={{ show: { transition: { staggerChildren: 0.08 } } }}>
          {works.map((w, i) => (
            <motion.figure key={w.photo} className={`work ${w.span}`} style={{ margin: 0 }} variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } } }} onClick={() => setOpen(i)} tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') setOpen(i) }} role="button" aria-label={`Открыть: ${w.caption}`}>
              <motion.img layoutId={`work-${i}`} src={ready ? photo(w.photo, true) : undefined} alt={w.caption} decoding="async" />
              <figcaption>{w.caption}</figcaption>
            </motion.figure>
          ))}
        </motion.div>
      </div>
      <AnimatePresence>
        {open !== null && (
          <motion.figure className="lightbox" style={{ margin: 0 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} onClick={() => setOpen(null)}>
            <motion.img layoutId={`work-${open}`} src={photo(works[open].photo)} alt={works[open].caption} transition={{ duration: 0.45, ease: EASE }} />
            <figcaption>{works[open].caption}</figcaption>
          </motion.figure>
        )}
      </AnimatePresence>
    </section>
  )
}
