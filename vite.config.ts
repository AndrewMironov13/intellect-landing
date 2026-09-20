import { defineConfig, type HtmlTagDescriptor, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { brand, hero, mainServices, moreServices, promo } from './src/content.ts'

const BASE = (process.env.VITE_BASE ?? '/').replace(/\/$/, '')
const SITE = (process.env.VITE_SITE_URL ?? '').replace(/\/$/, '')
const NOINDEX = process.env.VITE_NOINDEX === '1'
const abs = (p: string) => `${SITE}${BASE}${p}`
const price = (s: string) => Number(s.replace(/[^\d]/g, '')) || undefined

function jsonLd() {
  const offers: { name: string; price?: number }[] = [...mainServices.map((s: { title: string; price: string }) => ({ name: s.title, price: price(s.price) })), ...moreServices.map((s: { name: string; price: string }) => ({ name: s.name, price: price(s.price) }))]
  return {
    '@context': 'https://schema.org',
    '@type': ['AutoRepair', 'LocalBusiness'],
    '@id': abs('/#studio'),
    name: `Автостудия ${brand.name}`,
    alternateName: 'Интеллект',
    description: 'Оклейка кузова полиуретановой плёнкой, тонировка стёкол, сигнализация с автозапуском, антихром, полировка, шумоизоляция в Нижнем Новгороде',
    url: abs('/'),
    image: abs('/og.jpg'),
    telephone: brand.phone,
    address: { '@type': 'PostalAddress', streetAddress: brand.address, addressLocality: brand.city, addressRegion: 'Нижегородская область', addressCountry: 'RU' },
    areaServed: { '@type': 'City', name: brand.city },
    openingHoursSpecification: [{ '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '10:00', closes: '18:00' }],
    priceRange: '₽₽',
    currenciesAccepted: 'RUB',
    sameAs: [brand.vk],
    aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.8', ratingCount: String(brand.ratingCount), bestRating: '5' },
    makesOffer: offers.filter((o) => o.price).map((o) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: o.name, areaServed: brand.city }, price: o.price, priceCurrency: 'RUB', description: promo.text })),
  }
}

function seo(): Plugin {
  let outDir = 'dist'
  return {
    name: 'intellect-seo',
    configResolved(c) { outDir = c.build.outDir },
    transformIndexHtml(_html, ctx) {
      const isMain = /(^|\/)index\.html$/.test(ctx.path || ctx.filename)
      if (!isMain) return NOINDEX ? [{ tag: 'meta', attrs: { name: 'robots', content: 'noindex, nofollow' }, injectTo: 'head' as const }] : []
      const tags: HtmlTagDescriptor[] = [
        { tag: 'link', attrs: { rel: 'preload', as: 'image', href: `${BASE}/photos/${hero.photo}.webp`, fetchpriority: 'high' }, injectTo: 'head' as const },
        { tag: 'meta', attrs: { property: 'og:image', content: abs('/og.jpg') }, injectTo: 'head' as const },
        { tag: 'meta', attrs: { property: 'og:image:width', content: '1200' }, injectTo: 'head' as const },
        { tag: 'meta', attrs: { property: 'og:image:height', content: '630' }, injectTo: 'head' as const },
        { tag: 'meta', attrs: { name: 'twitter:card', content: 'summary_large_image' }, injectTo: 'head' as const },
        { tag: 'script', attrs: { type: 'application/ld+json' }, children: JSON.stringify(jsonLd()), injectTo: 'head' as const },
      ]
      if (SITE) tags.push({ tag: 'meta', attrs: { property: 'og:url', content: abs('/') }, injectTo: 'head' as const })
      if (SITE && !NOINDEX) tags.push({ tag: 'link', attrs: { rel: 'canonical', href: abs('/') }, injectTo: 'head' as const })
      if (NOINDEX) tags.push({ tag: 'meta', attrs: { name: 'robots', content: 'noindex, nofollow' }, injectTo: 'head' as const })
      return tags
    },
    closeBundle() {
      mkdirSync(outDir, { recursive: true })
      const today = new Date().toISOString().slice(0, 10)
      if (SITE && !NOINDEX) {
        writeFileSync(join(outDir, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${abs('/sitemap.xml')}\n`)
        writeFileSync(join(outDir, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${abs('/')}</loc><lastmod>${today}</lastmod></url>\n</urlset>\n`)
      } else {
        // демо-копия без домена: в индекс не пускаем
        writeFileSync(join(outDir, 'robots.txt'), 'User-agent: *\nDisallow: /\n')
      }
    },
  }
}

export default defineConfig(({ command }) => ({
  plugins: [react(), seo()],
  base: BASE + '/',
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  server: { port: 5198, strictPort: true, host: '127.0.0.1' },
  preview: { port: 5198, strictPort: true },
  build: { target: 'es2020', cssMinify: true, sourcemap: command === 'serve', rollupOptions: { input: { main: 'index.html', privacy: 'privacy.html' } } },
}))
