import { motion, useReducedMotion } from 'motion/react'
import { ArrowUpRight } from 'lucide-react'
import { brand, promo, reviews, servicePages, type ServicePage as Page } from '@/content'
import { asset } from '@/lib/asset'
import { Nav } from '@/components/Nav'
import { ServiceHero } from '@/components/ServiceHero'
import { Constructor } from '@/components/Constructor'
import { Works } from '@/components/Works'
import { Faq } from '@/components/Faq'
import { Contact } from '@/components/Contact'
import { OtherServices } from '@/components/OtherServices'
import { Footer } from '@/components/Footer'
import { Reveal } from '@/components/Reveal'

const EASE = [0.2, 0.7, 0.2, 1] as const
const item = { hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } } }

function Stagger({ className, children, gap = 0.08 }: { className: string; children: React.ReactNode; gap?: number }) {
  const reduce = useReducedMotion()
  return (
    <motion.div className={className} initial={reduce ? 'show' : 'hidden'} whileInView="show" viewport={{ once: true, margin: '0px 0px -80px 0px' }} variants={{ show: { transition: { staggerChildren: gap } } }}>
      {children}
    </motion.div>
  )
}

export function ServicePage({ slug }: { slug: string }) {
  const page: Page = servicePages.find((p) => p.slug === slug) ?? servicePages[0]
  const navItems = [
    ...servicePages.map((p) => ({ href: asset(`${p.slug}.html`), label: p.navShort })),
    { href: '#prices', label: 'Цены' },
    { href: '#reviews', label: 'Отзывы' },
    { href: '#contact', label: 'Контакты' },
  ]
  const mapsUrl = `https://yandex.ru/maps/?text=${encodeURIComponent(brand.mapsQuery)}`
  const pageReviews = page.reviewIdx.map((i) => reviews[i]).filter(Boolean)

  return (
    <>
      <Nav items={navItems} home={false} current={page.slug} />
      <main>
        <ServiceHero page={page} />

        <section className="section svc-intro">
          <div className="container svc-intro__grid">
            <Reveal>
              <p className="eyebrow">Коротко</p>
              <h2 className="h2" style={{ marginTop: 16 }}>{page.introTitle}</h2>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="svc-intro__text">{page.intro.map((t) => <p key={t.slice(0, 24)}>{t}</p>)}</div>
            </Reveal>
          </div>
        </section>

        <section className="section" id="included" style={{ paddingTop: 0 }}>
          <div className="container">
            <Reveal><div className="head"><p className="eyebrow">Что делаем</p><h2 className="h2" style={{ marginTop: 16 }}>{page.includesTitle}</h2></div></Reveal>
            <Stagger className={`feats feats--${page.includes.length}`}>
              {page.includes.map((f) => (
                <motion.article className="feat" key={f.name} variants={item}>
                  <span className="feat__hex" aria-hidden="true" />
                  <h3 className="feat__title">{f.name}</h3>
                  <p className="feat__text">{f.text}</p>
                </motion.article>
              ))}
            </Stagger>
          </div>
        </section>

        {page.primary.target === 'constructor' && <Constructor />}

        <section className="section" id="prices" style={{ background: 'var(--bg-2)' }}>
          <div className="container">
            <Reveal>
              <div className="head head--split">
                <div><p className="eyebrow">Цены</p><h2 className="h2" style={{ marginTop: 16 }}>{page.pricesTitle}</h2></div>
                <p className="lead">{page.priceNote}</p>
              </div>
            </Reveal>
            <Stagger className="rows" gap={0.05}>
              {page.prices.map((r) => (
                <motion.div className="row" key={r.name} variants={{ hidden: { opacity: 0, x: -14 }, show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: EASE } } }}>
                  <span className="row__name">{r.name}</span>
                  <span className="row__note">{r.note ?? ''}</span>
                  <span className="row__price">{r.price}</span>
                </motion.div>
              ))}
            </Stagger>
            {page.slug === 'okleyka' && (
              <Reveal><div className="promo"><span className="promo__title">{promo.title}</span><span className="promo__text">{promo.text}</span><span className="promo__until">{promo.until}</span></div></Reveal>
            )}
          </div>
        </section>

        <section className="section" id="steps">
          <div className="container">
            <Reveal><div className="head"><p className="eyebrow">Порядок работы</p><h2 className="h2" style={{ marginTop: 16 }}>{page.stepsTitle}</h2></div></Reveal>
            <Stagger className="steps">
              {page.steps.map((st, i) => (
                <motion.div className="step" key={st} variants={item}>
                  <span className="step__n">{String(i + 1).padStart(2, '0')}</span>
                  <p className="step__text">{st}</p>
                </motion.div>
              ))}
            </Stagger>
          </div>
        </section>

        {page.photos.length > 0 && <Works photos={page.photos} title="Работы из нашего бокса" lead="Машины наших клиентов на Переходникова, 27Г" />}

        <section className="section" id="reviews" style={{ background: 'var(--bg-2)' }}>
          <div className="container">
            <Reveal>
              <div className="head head--split">
                <div><p className="eyebrow">Отзывы</p><h2 className="h2" style={{ marginTop: 16 }}>Отзывы о нас</h2></div>
                <div className="svc-rating"><span className="svc-rating__v">{brand.rating}</span><span className="svc-rating__l">★★★★★<br />рейтинг на Яндекс Картах</span></div>
              </div>
            </Reveal>
            <Stagger className="reviews reviews--two">
              {pageReviews.map((r) => (
                <motion.article className="review" key={r.name + r.date} variants={item}>
                  <div className="review__head">
                    <div><div className="review__name">{r.name}</div><div className="review__date">{r.date}</div></div>
                    <div className="review__stars" aria-label="5 из 5">★★★★★</div>
                  </div>
                  <p className="review__text">{r.text}</p>
                  <div className="review__tags">{r.tags.map((t) => <span className="tag" key={t}>{t}</span>)}</div>
                </motion.article>
              ))}
            </Stagger>
            <Reveal><a className="reviews__more" href={mapsUrl} target="_blank" rel="noopener">Все отзывы на Яндекс Картах <ArrowUpRight size={18} /></a></Reveal>
          </div>
        </section>

        <Faq items={page.faq} title="Вопросы и ответы" />
        <Contact defaultService={page.ctaService} />
        <OtherServices current={page.slug} />
      </main>
      <Footer home={false} />
    </>
  )
}
