// Генерирует статические страницы услуг из src/content.ts (Node 24 читает TS сам).
// Запускается перед vite build: npm run build → node scripts/gen-pages.mjs && vite build
import { writeFileSync } from 'node:fs'
import { brand, servicePages, reviews, promo, channels } from '../src/content.ts'

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')
const tg = channels.telegram ? `https://t.me/${channels.telegram}?text=${encodeURIComponent(channels.prefill + 'Хочу ')}` : ''
const icon = {
  phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/></svg>',
  max: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 21l1.9-5.4A8 8 0 1 1 21 12z"/><path d="M8 12h.01M12 12h.01M16 12h.01"/></svg>',
  telegram: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.9 4.6 18.7 19.4c-.2 1-.9 1.3-1.8.8l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.4-5 9.1-8.2c.4-.4-.1-.5-.6-.2L6.2 13.1 1.4 11.6c-1-.3-1-1 .2-1.5L20.5 3c.9-.3 1.6.2 1.4 1.6z"/></svg>',
}

for (const p of servicePages) {
  const others = servicePages.filter((o) => o.slug !== p.slug)
  const revs = p.reviewIdx.map((i) => reviews[i])
  const html = `<!doctype html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${esc(p.title)}</title>
    <meta name="description" content="${esc(p.description)}" />
    <meta name="theme-color" content="#141414" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta property="og:type" content="article" />
    <meta property="og:title" content="${esc(p.h1)} — автостудия Intellect" />
    <meta property="og:description" content="${esc(p.lead)}" />
    <meta property="og:locale" content="ru_RU" />
    <meta name="page-slug" content="${p.slug}" />
  </head>
  <body>
    <header class="nav is-scrolled">
      <div class="nav__inner">
        <a href="./" class="logo" aria-label="Intellect — на главную"><span class="logo__mark">intellect</span><span class="logo__dot" aria-hidden="true"></span></a>
        <nav class="nav__links" aria-label="Услуги">${servicePages.map((o) => `<a href="./${o.slug}.html"${o.slug === p.slug ? ' aria-current="page"' : ''}>${o.nav}</a>`).join('')}<a href="./#works">Работы</a><a href="./#reviews">Отзывы</a></nav>
        <div class="nav__right">
          <div class="nav__quick" aria-label="Быстрая связь">
            <a class="qbtn qbtn--phone" href="${brand.phoneHref}" aria-label="Позвонить ${brand.phone}">${icon.phone}</a>
            ${channels.max ? `<a class="qbtn qbtn--max" href="${channels.max}" target="_blank" rel="noopener" aria-label="Написать в Max">${icon.max}</a>` : ''}
            ${tg ? `<a class="qbtn qbtn--telegram" href="${tg}" target="_blank" rel="noopener" aria-label="Написать в Telegram">${icon.telegram}</a>` : ''}
          </div>
          <a class="nav__phone" href="${brand.phoneHref}">${brand.phone}</a>
          <a class="btn btn--ghost btn--sm nav__cta" href="./#contact">Записаться</a>
        </div>
      </div>
    </header>
    <main class="page">
      <div class="container page__inner">
        <nav class="crumbs" aria-label="Хлебные крошки"><a href="./">Главная</a><span>/</span><a href="./#services">Услуги</a><span>/</span><span aria-current="page">${p.nav}</span></nav>
        <p class="eyebrow">Автостудия · ${brand.city}</p>
        <h1 class="h2 page__h1">${p.h1}</h1>
        <p class="lead page__lead">${p.lead}</p>
        <div class="page__cta">
          <a class="btn btn--primary" href="./#contact">Записаться на осмотр</a>
          <a class="btn btn--ghost" href="${brand.phoneHref}">${brand.phone}</a>
        </div>
        ${p.intro.map((t) => `<p class="page__p">${t}</p>`).join('\n        ')}

        <h2 class="page__h2">Что делаем</h2>
        <div class="page__grid">${p.includes.map((i) => `<div class="page__card"><b>${i.name}</b><p>${i.text}</p></div>`).join('')}</div>

        <h2 class="page__h2">Цены</h2>
        <div class="rows">${p.prices.map((r) => `<div class="row"><span class="row__name">${r.name}</span>${r.note ? `<span class="row__note">${r.note}</span>` : '<span class="row__note"></span>'}<span class="row__price">${r.price}</span></div>`).join('')}</div>
        <p class="page__note">${p.priceNote}</p>
        ${p.slug === 'okleyka' ? `<p class="page__note"><b>${promo.title}.</b> ${promo.text}, ${promo.until}</p>` : ''}

        <h2 class="page__h2">Как проходит</h2>
        <ol class="page__steps">${p.steps.map((s) => `<li>${s}</li>`).join('')}</ol>

        <h2 class="page__h2">Отзывы клиентов</h2>
        <div class="page__reviews">${revs.map((r) => `<blockquote class="review"><div class="review__head"><div><div class="review__name">${r.name}</div><div class="review__date">${r.date}</div></div><div class="review__stars" aria-label="5 из 5">★★★★★</div></div><p class="review__text">${r.text}</p></blockquote>`).join('')}</div>
        <p class="page__note"><a href="https://yandex.ru/maps/?text=${encodeURIComponent(brand.mapsQuery)}" target="_blank" rel="noopener">Все отзывы на Яндекс Картах</a> — рейтинг ${brand.rating}</p>

        <h2 class="page__h2">Вопросы и ответы</h2>
        <div class="faq">${p.faq.map((f) => `<details class="faq__item"><summary>${f.q}</summary><p>${f.a}</p></details>`).join('')}</div>

        <div class="page__final">
          <h2 class="page__h2">Запишитесь на осмотр</h2>
          <p class="page__p">Посмотрим машину, назовём точную цену и срок. Бокс — ${brand.address}, ${brand.metro}. ${brand.hours}</p>
          <div class="page__cta"><a class="btn btn--primary" href="./#contact">Оставить заявку</a><a class="btn btn--ghost" href="${brand.phoneHref}">Позвонить ${brand.phone}</a></div>
          <p class="page__note">Другие услуги: ${others.map((o) => `<a href="./${o.slug}.html">${o.nav.toLowerCase()}</a>`).join(', ')}, <a href="./#services">все услуги и цены</a></p>
        </div>
      </div>
    </main>
    <footer class="footer"><div class="container footer__inner"><a href="./" class="logo"><span class="logo__mark">intellect</span><span class="logo__dot" aria-hidden="true"></span></a><span>${brand.legal} · ${brand.city}, ${brand.address}</span><span><a href="${brand.phoneHref}">${brand.phone}</a> · <a href="${brand.vk}" target="_blank" rel="noopener">ВКонтакте</a></span><a class="footer__legal" href="./privacy.html">Политика конфиденциальности</a></div></footer>
    <script type="module" src="/src/privacy.ts"></script>
  </body>
</html>
`
  writeFileSync(`${p.slug}.html`, html)
  console.log('page:', p.slug + '.html', Math.round(html.length / 1024) + ' KB')
}
