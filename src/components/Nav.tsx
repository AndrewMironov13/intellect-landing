import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react'
import { brand, nav as homeNav } from '@/content'
import { asset } from '@/lib/asset'
import { scrollTo } from '@/lib/lead'
import { goal } from '@/lib/metrika'
import { MessengerIcon } from './Messengers'
import { messengerLinks } from '@/lib/channels'
import { Phone } from 'lucide-react'

export function Logo({ home = true }: { home?: boolean }) {
  return (
    <a href={home ? '#top' : asset('')} className="logo" aria-label="«Интеллект» — на главную" onClick={home ? (e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) } : undefined}>
      <span className="logo__mark">intellect</span>
      <span className="logo__dot" aria-hidden="true" />
    </a>
  )
}

type NavItem = { href: string; label: string }

/** На главной пункты — якоря; на страницах услуг — ссылки на другие страницы плюс якоря текущей */
export function Nav({ items = homeNav, home = true, current }: { items?: NavItem[]; home?: boolean; current?: string }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { scrollY } = useScroll()
  useMotionValueEvent(scrollY, 'change', (v) => setScrolled(v > 40))
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  // якорь этой страницы — плавная прокрутка; ссылка на другую страницу — обычный переход
  const go = (href: string) => (e: React.MouseEvent) => {
    setOpen(false)
    if (href.startsWith('#') && document.getElementById(href.slice(1))) { e.preventDefault(); scrollTo(href.slice(1)) }
  }
  const isCurrent = (href: string) => (current && href.endsWith(`${current}.html`) ? 'page' : undefined)

  return (
    <>
      <header className={`nav${scrolled ? ' is-scrolled' : ''}`}>
        <div className="nav__inner">
          <Logo home={home} />
          <nav className="nav__links" aria-label="Разделы">
            {items.map((n) => <a key={n.href} href={n.href} onClick={go(n.href)} aria-current={isCurrent(n.href)}>{n.label}</a>)}
          </nav>
          <div className="nav__right">
            <div className="nav__quick" aria-label="Быстрая связь">
              <a className="qbtn qbtn--phone" href={brand.phoneHref} aria-label={`Позвонить ${brand.phone}`} onClick={() => goal('phone', { where: 'nav-mobile' })}><Phone strokeWidth={2} /></a>
              {messengerLinks('Хочу ').map((l) => (
                <a key={l.id} className={`qbtn qbtn--${l.id}`} href={l.href} target="_blank" rel="noopener" aria-label={`Написать в ${l.label}`} onClick={() => goal('messenger', { which: l.id, where: 'nav-mobile' })}><MessengerIcon id={l.id} /></a>
              ))}
            </div>
            <a className="nav__phone" href={brand.phoneHref} onClick={() => goal('phone', { where: 'nav' })}>{brand.phone}</a>
            <a className="btn btn--ghost btn--sm nav__cta" href="#contact" onClick={go('#contact')}>Записаться</a>
            <button className="burger" aria-label="Открыть меню" aria-expanded={open} onClick={() => setOpen(true)}><span /></button>
          </div>
        </div>
      </header>
      <AnimatePresence>
        {open && (
          <motion.div className="menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            <div className="menu__top">
              <Logo home={home} />
              <button className="menu__close" aria-label="Закрыть меню" onClick={() => setOpen(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
              </button>
            </div>
            <motion.div className="menu__list" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } } }}>
              {items.map((n) => (
                <motion.a key={n.href} href={n.href} onClick={go(n.href)} aria-current={isCurrent(n.href)} variants={{ hidden: { opacity: 0, x: -16 }, show: { opacity: 1, x: 0 } }}>{n.label}</motion.a>
              ))}
            </motion.div>
            <div className="menu__actions" aria-label="Связаться">
              <a className="action" href={brand.phoneHref} onClick={() => goal('phone', { where: 'menu' })}>
                <span className="action__icon action__icon--phone"><Phone strokeWidth={2} /></span>
                <b>Позвонить</b><small>{brand.phone}</small>
              </a>
              {messengerLinks('Хочу ').map((l) => (
                <a key={l.id} className="action" href={l.href} target="_blank" rel="noopener" onClick={() => goal('messenger', { which: l.id, where: 'menu' })}>
                  <span className={`action__icon action__icon--${l.id}`}><MessengerIcon id={l.id} /></span>
                  <b>{l.label}</b><small>написать</small>
                </a>
              ))}
            </div>
            <div className="menu__bottom">
              <span style={{ color: 'var(--muted)', fontSize: 14 }}>{brand.hours} · {brand.address}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
