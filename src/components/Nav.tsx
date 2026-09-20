import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react'
import { brand, nav } from '@/content'
import { scrollTo } from '@/lib/lead'
import { goal } from '@/lib/metrika'
import { MessengerIcon } from './Messengers'
import { messengerLinks } from '@/lib/channels'
import { Phone } from 'lucide-react'

export function Logo() {
  return (
    <a href="#top" className="logo" aria-label="Intellect — на главную" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
      <span className="logo__mark">intellect</span>
      <span className="logo__dot" aria-hidden="true" />
    </a>
  )
}

export function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { scrollY } = useScroll()
  useMotionValueEvent(scrollY, 'change', (v) => setScrolled(v > 40))
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const go = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault(); setOpen(false); scrollTo(href.slice(1))
  }

  return (
    <>
      <header className={`nav${scrolled ? ' is-scrolled' : ''}`}>
        <div className="nav__inner">
          <Logo />
          <nav className="nav__links" aria-label="Разделы">
            {nav.map((n) => <a key={n.href} href={n.href} onClick={go(n.href)}>{n.label}</a>)}
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
              <Logo />
              <button className="menu__close" aria-label="Закрыть меню" onClick={() => setOpen(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
              </button>
            </div>
            <motion.div className="menu__list" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } } }}>
              {nav.map((n) => (
                <motion.a key={n.href} href={n.href} onClick={go(n.href)} variants={{ hidden: { opacity: 0, x: -16 }, show: { opacity: 1, x: 0 } }}>{n.label}</motion.a>
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
