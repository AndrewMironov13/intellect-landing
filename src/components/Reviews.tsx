import { motion, useReducedMotion } from 'motion/react'
import { ArrowUpRight } from 'lucide-react'
import { brand, reviewStats, reviews } from '@/content'
import { Reveal } from './Reveal'

const EASE = [0.2, 0.7, 0.2, 1] as const

export function Reviews() {
  const reduce = useReducedMotion()
  const mapsUrl = `https://yandex.ru/maps/?text=${encodeURIComponent(brand.mapsQuery)}`
  return (
    <section className="section" id="reviews" style={{ background: 'var(--bg-2)' }}>
      <div className="container">
        <Reveal>
          <div className="head head--split">
            <div>
              <p className="eyebrow">Отзывы</p>
              <h2 className="h2" style={{ marginTop: 16 }}>Наши отзывы на Яндекс Картах</h2>
            </div>
            <p className="lead">Чаще всего к нам едут за тонировкой и плёнкой на детали. Ниже — отзывы с нашей карточки на Картах, там же можно оставить свой</p>
          </div>
        </Reveal>
        <motion.div className="stats" initial={reduce ? 'show' : 'hidden'} whileInView="show" viewport={{ once: true, margin: '0px 0px -80px 0px' }} variants={{ show: { transition: { staggerChildren: 0.1 } } }}>
          {reviewStats.map((s) => (
            <motion.div className="stat" key={s.label} variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } } }}>
              <div className="stat__v">{s.value}</div>
              <div className="stat__l">{s.label}</div>
            </motion.div>
          ))}
        </motion.div>
        <motion.div className="reviews" initial={reduce ? 'show' : 'hidden'} whileInView="show" viewport={{ once: true, margin: '0px 0px -80px 0px' }} variants={{ show: { transition: { staggerChildren: 0.08 } } }}>
          {reviews.map((r) => (
            <motion.article className="review" key={r.name + r.date} variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } } }}>
              <div className="review__head">
                <div><div className="review__name">{r.name}</div><div className="review__date">{r.date}</div></div>
                <div className="review__stars" aria-label="5 из 5">★★★★★</div>
              </div>
              <p className="review__text">{r.text}</p>
              <div className="review__tags">{r.tags.map((t) => <span className="tag" key={t}>{t}</span>)}</div>
            </motion.article>
          ))}
        </motion.div>
        <Reveal><a className="reviews__more" href={mapsUrl} target="_blank" rel="noopener">Все отзывы на Яндекс Картах <ArrowUpRight size={18} /></a></Reveal>
      </div>
    </section>
  )
}
