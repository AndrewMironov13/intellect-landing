import { motion, useReducedMotion } from 'motion/react'
import { ArrowRight, Snowflake } from 'lucide-react'
import { mainServices, moreServices, promo } from '@/content'
import { photo } from '@/lib/asset'
import { scrollTo } from '@/lib/lead'
import { Reveal } from './Reveal'
import { useDeferred } from '@/lib/useDeferred'

const EASE = [0.2, 0.7, 0.2, 1] as const

export function Services() {
  const reduce = useReducedMotion()
  const ready = useDeferred()
  const go = (href: string) => (e: React.MouseEvent) => { e.preventDefault(); scrollTo(href.slice(1)) }
  return (
    <section className="section" id="services">
      <div className="container">
        <Reveal>
          <div className="head head--split">
            <div>
              <p className="eyebrow">Услуги и цены</p>
              <h2 className="h2" style={{ marginTop: 16 }}>Три вещи, за которыми к нам едут</h2>
            </div>
            <p className="lead">Точную цену назовём после осмотра: зависит от размера машины и выбранной плёнки</p>
          </div>
        </Reveal>

        <motion.div className="svc-grid" initial={reduce ? 'show' : 'hidden'} whileInView="show" viewport={{ once: true, margin: '0px 0px -120px 0px' }} variants={{ show: { transition: { staggerChildren: 0.12 } } }}>
          {mainServices.map((s) => (
            <motion.article key={s.id} className={`svc${s.photo ? '' : ' svc--winter'}`} variants={{ hidden: { opacity: 0, y: 36 }, show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE } } }}>
              {s.photo ? (
                <div className="svc__img"><img src={ready ? photo(s.photo, true) : undefined} alt={s.alt} decoding="async" /></div>
              ) : (
                <Snowflake className="svc__glyph" strokeWidth={0.8} aria-hidden="true" />
              )}
              <div className="svc__price">{s.price}<small>{s.priceNote}</small></div>
              <h3 className="svc__title">{s.title}</h3>
              <p className="svc__text">{s.text}</p>
              <span className="svc__cta">{s.cta} <ArrowRight /></span>
              <a className="svc__link" href={s.href} onClick={go(s.href)} aria-label={`${s.title}: ${s.cta}`} />
            </motion.article>
          ))}
        </motion.div>

        <div className="more">
          <Reveal>
            <h3 className="more__title">Ещё делаем в боксе</h3>
            <p className="more__hint">Всё под одной крышей: приехали на оклейку — заодно сделали тонировку и полировку</p>
          </Reveal>
          <motion.div className="rows" initial={reduce ? 'show' : 'hidden'} whileInView="show" viewport={{ once: true, margin: '0px 0px -60px 0px' }} variants={{ show: { transition: { staggerChildren: 0.06 } } }}>
            {moreServices.map((r) => (
              <motion.div className="row" key={r.name} variants={{ hidden: { opacity: 0, x: -14 }, show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: EASE } } }}>
                <span className="row__name">{r.name}</span>
                <span className="row__note">{r.note}</span>
                <span className="row__price">{r.price}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <Reveal>
          <div className="promo">
            <span className="promo__title">{promo.title}</span>
            <span className="promo__text">{promo.text}</span>
            <span className="promo__until">{promo.until}</span>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
