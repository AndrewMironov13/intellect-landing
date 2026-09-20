import { brand } from '@/content'
import { Logo } from './Nav'
import { goal } from '@/lib/metrika'

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <Logo />
        <span>{brand.legal} · {brand.city}, {brand.address}</span>
        <span><a href={brand.phoneHref} onClick={() => goal('phone', { where: 'footer' })}>{brand.phone}</a> · <a href={brand.vk} target="_blank" rel="noopener">ВКонтакте</a></span>
        <span>© {new Date().getFullYear()} Автостудия Intellect</span>
      </div>
    </footer>
  )
}
