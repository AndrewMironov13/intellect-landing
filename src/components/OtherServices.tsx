import { motion, useReducedMotion } from 'motion/react'
import { ArrowRight, Snowflake } from 'lucide-react'
import { mainServices } from '@/content'
import { asset, photo } from '@/lib/asset'
import { Reveal } from './Reveal'

const EASE = [0.2, 0.7, 0.2, 1] as const

/** Две другие услуги карточками — переход между страницами услуг */
export function OtherServices({ current }: { current: string }) {
  const reduce = useReducedMotion()
  const list = mainServices.filter((s) => s.page !== current)
  return (
    <section className="section" id="more" style={{ paddingTop: 0 }}>
      <div className="container">
        <Reveal>
          <div className="head">
            <p className="eyebrow">Ещё делаем</p>
            <h2 className="h2" style={{ marginTop: 16 }}>Приезжайте за всем сразу</h2>
          </div>
        </Reveal>
        <motion.div className="svc-grid svc-grid--two" initial={reduce ? 'show' : 'hidden'} whileInView="show" viewport={{ once: true, margin: '0px 0px -120px 0px' }} variants={{ show: { transition: { staggerChildren: 0.12 } } }}>
          {list.map((s) => (
            <motion.article key={s.id} className={`svc${s.photo ? '' : ' svc--winter'}`} variants={{ hidden: { opacity: 0, y: 36 }, show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE } } }}>
              {s.photo ? <div className="svc__img"><img src={photo(s.photo, true)} alt={s.alt} loading="lazy" decoding="async" /></div> : <Snowflake className="svc__glyph" strokeWidth={0.8} aria-hidden="true" />}
              <div className="svc__price">{s.price}<small>{s.priceNote}</small></div>
              <h3 className="svc__title">{s.title}</h3>
              <p className="svc__text">{s.text}</p>
              <span className="svc__cta">Подробнее и цены <ArrowRight /></span>
              <a className="svc__link" href={asset(`${s.page}.html`)} aria-label={`${s.title}: подробнее и цены`} />
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
