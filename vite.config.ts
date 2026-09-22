import { defineConfig, type HtmlTagDescriptor, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs'
import { join, basename } from 'node:path'
import { brand, hero, mainServices, moreServices, promo, seo, faq, servicePages, reviews, metrika } from './src/content.ts'

const BASE = (process.env.VITE_BASE ?? '/').replace(/\/$/, '')
const SITE = (process.env.VITE_SITE_URL ?? '').replace(/\/$/, '')
const NOINDEX = process.env.VITE_NOINDEX === '1'
const abs = (p: string) => `${SITE}${BASE}${p}`
const price = (s: string) => Number(s.replace(/[^\d]/g, '')) || undefined
const ID = abs('/#studio')

function business() {
  const offers: { name: string; price?: number }[] = [
    ...mainServices.map((s: { title: string; price: string }) => ({ name: s.title, price: price(s.price) })),
    ...moreServices.map((s: { name: string; price: string }) => ({ name: s.name, price: price(s.price) })),
  ]
  return {
    '@type': ['AutoRepair', 'LocalBusiness'],
    '@id': ID,
    name: 'Автостудия «Интеллект»',
    alternateName: ['Интеллект', 'Intellect', 'Интеллект детейлинг', 'Intellect Detailing', 'Автостудия Intellect'],
    description: seo.description,
    url: abs('/'),
    image: abs('/og.jpg'),
    logo: abs('/favicon.svg'),
    telephone: brand.phone,
    address: { '@type': 'PostalAddress', streetAddress: brand.address, addressLocality: brand.city, addressRegion: 'Нижегородская область', postalCode: '603004', addressCountry: 'RU' },
    geo: { '@type': 'GeoCoordinates', latitude: seo.geo.lat, longitude: seo.geo.lon },
    hasMap: `https://yandex.ru/maps/?text=${encodeURIComponent(brand.mapsQuery)}`,
    areaServed: [{ '@type': 'City', name: brand.city }, { '@type': 'Place', name: `${seo.district}, ${brand.city}` }],
    openingHoursSpecification: [{ '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '10:00', closes: '18:00' }],
    priceRange: '₽₽',
    currenciesAccepted: 'RUB',
    paymentAccepted: 'Наличные, карта',
    sameAs: [brand.vk],
    aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.8', ratingCount: String(brand.ratingCount), reviewCount: String(brand.reviewCount), bestRating: '5' },
    review: reviews.slice(0, 3).map((r: { name: string; text: string }) => ({ '@type': 'Review', author: { '@type': 'Person', name: r.name }, reviewBody: r.text, reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' } })),
    makesOffer: offers.filter((o) => o.price).map((o) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: o.name, areaServed: brand.city, provider: { '@id': ID } }, price: o.price, priceCurrency: 'RUB', description: promo.text })),
  }
}
const faqLd = (items: { q: string; a: string }[]) => ({ '@type': 'FAQPage', mainEntity: items.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) })
const crumbsLd = (name: string, path: string) => ({ '@type': 'BreadcrumbList', itemListElement: [
  { '@type': 'ListItem', position: 1, name: 'Главная', item: abs('/') },
  { '@type': 'ListItem', position: 2, name: 'Услуги', item: abs('/#services') },
  { '@type': 'ListItem', position: 3, name, item: abs(path) },
] })
const graph = (items: object[]) => JSON.stringify({ '@context': 'https://schema.org', '@graph': items })

const PAGES: { file: string; path: string; priority: string }[] = [
  { file: 'index.html', path: '/', priority: '1.0' },
  ...servicePages.map((p: { slug: string }) => ({ file: `${p.slug}.html`, path: `/${p.slug}.html`, priority: '0.9' })),
  { file: 'privacy.html', path: '/privacy.html', priority: '0.2' },
]

function seoPlugin(): Plugin {
  let outDir = 'dist'
  return {
    name: 'intellect-seo',
    configResolved(c) { outDir = c.build.outDir },
    transformIndexHtml(html, ctx) {
      const file = basename(ctx.filename)
      const page = PAGES.find((p) => p.file === file)
      const tags: HtmlTagDescriptor[] = []
      const meta = (attrs: Record<string, string>) => tags.push({ tag: 'meta', attrs, injectTo: 'head' })
      if (NOINDEX) meta({ name: 'robots', content: 'noindex, nofollow' })
      if (seo.yandexVerification) meta({ name: 'yandex-verification', content: seo.yandexVerification })
      if (seo.googleVerification) meta({ name: 'google-site-verification', content: seo.googleVerification })
      if (page && SITE) {
        meta({ property: 'og:url', content: abs(page.path) })
        if (!NOINDEX) tags.push({ tag: 'link', attrs: { rel: 'canonical', href: abs(page.path) }, injectTo: 'head' })
      }
      if (metrika.id) {
        tags.push({ tag: 'noscript', children: `<div><img src="https://mc.yandex.ru/watch/${metrika.id}" style="position:absolute;left:-9999px" alt="" /></div>`, injectTo: 'body-prepend' })
        if (file === 'privacy.html') tags.push({ tag: 'script', children: `if(!['localhost','127.0.0.1'].includes(location.hostname)){(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,'script','https://mc.yandex.ru/metrika/tag.js?id=${metrika.id}','ym');ym(${metrika.id},'init',{ssr:true,webvisor:true,clickmap:true,referrer:document.referrer,url:location.href,accurateTrackBounce:true,trackLinks:true});}`, injectTo: 'head' })
      }
      if (file === 'privacy.html') return { html, tags }
      // пререндер для краулеров без JS: фрагменты собираются локально (npm run prerender) и коммитятся
      const fragFile = file === 'index.html' ? 'prerender/root.html' : `prerender/${file}`
      if (process.env.PRERENDER_SKIP !== '1') {
        if (existsSync(fragFile)) {
          const frag = readFileSync(fragFile, 'utf8').replace(/__BASE__/g, BASE)
          html = html.replace('<div id="root"></div>', `<div id="root"><div data-prerender>${frag}</div></div>`)
        } else this.warn(`${fragFile} не найден — краулеры без JS увидят пустую страницу. Запусти npm run prerender`)
      }
      meta({ property: 'og:image', content: abs('/og.jpg') }); meta({ property: 'og:image:width', content: '1200' }); meta({ property: 'og:image:height', content: '630' })
      meta({ name: 'twitter:card', content: 'summary_large_image' })
      meta({ name: 'geo.region', content: 'RU-NIZ' }); meta({ name: 'geo.placename', content: brand.city }); meta({ name: 'geo.position', content: `${seo.geo.lat};${seo.geo.lon}` }); meta({ name: 'ICBM', content: `${seo.geo.lat}, ${seo.geo.lon}` })
      if (file === 'index.html') {
        html = html.replace(/__TITLE__/g, seo.title).replace(/__DESC__/g, seo.description)
        meta({ name: 'keywords', content: seo.keywords })
        tags.push({ tag: 'link', attrs: { rel: 'preload', as: 'image', href: `${BASE}/photos/${hero.photo}.webp`, fetchpriority: 'high' }, injectTo: 'head' })
        tags.push({ tag: 'script', attrs: { type: 'application/ld+json' }, children: graph([business(), faqLd(faq)]), injectTo: 'head' })
      } else {
        const sp = servicePages.find((p: { slug: string }) => `${p.slug}.html` === file)
        if (sp) {
          meta({ name: 'keywords', content: seo.keywords })
          if (sp.hero.photo) tags.push({ tag: 'link', attrs: { rel: 'preload', as: 'image', href: `${BASE}/photos/${sp.hero.photo}.webp`, fetchpriority: 'high' }, injectTo: 'head' })
          tags.push({ tag: 'script', attrs: { type: 'application/ld+json' }, children: graph([
            { '@type': 'Service', name: sp.h1, description: sp.description, areaServed: brand.city, provider: { '@id': ID }, url: abs(`/${sp.slug}.html`) },
            faqLd(sp.faq), crumbsLd(sp.nav, `/${sp.slug}.html`), business(),
          ]), injectTo: 'head' })
        }
      }
      return { html, tags }
    },
    closeBundle() {
      mkdirSync(outDir, { recursive: true })
      const today = new Date().toISOString().slice(0, 10)
      if (SITE && !NOINDEX) {
        writeFileSync(join(outDir, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${abs('/sitemap.xml')}\n`)
        const urls = PAGES.map((p) => `  <url><loc>${abs(p.path)}</loc><lastmod>${today}</lastmod><priority>${p.priority}</priority></url>`).join('\n')
        writeFileSync(join(outDir, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`)
      } else {
        writeFileSync(join(outDir, 'robots.txt'), 'User-agent: *\nDisallow: /\n')
      }
    },
  }
}

export default defineConfig(({ command }) => ({
  plugins: [react(), seoPlugin()],
  base: BASE + '/',
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  server: { port: 5198, strictPort: true, host: '127.0.0.1' },
  preview: { port: 5198, strictPort: true },
  build: { target: 'es2020', cssMinify: true, sourcemap: command === 'serve', rollupOptions: { input: Object.fromEntries(PAGES.map((p) => [p.file.replace('.html', ''), p.file])) } },
}))
