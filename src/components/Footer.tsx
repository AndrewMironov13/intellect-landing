import { brand, contact, servicePages } from '@/content'
import { asset } from '@/lib/asset'
import { Logo } from './Nav'
import { goal } from '@/lib/metrika'

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <Logo />
        <nav className="footer__links" aria-label="Услуги">{servicePages.map((p) => <a key={p.slug} href={asset(`${p.slug}.html`)}>{p.nav}</a>)}</nav>
        <span>{brand.legal} · {brand.city}, {brand.address}</span>
        <span><a href={brand.phoneHref} onClick={() => goal('phone', { where: 'footer' })}>{brand.phone}</a> · <a href={brand.vk} target="_blank" rel="noopener">ВКонтакте</a></span>
        <a className="footer__legal" href={asset(contact.privacyPath)}>Политика конфиденциальности</a>
        <span>© {new Date().getFullYear()} Автостудия Intellect</span>
      </div>
    </footer>
  )
}
