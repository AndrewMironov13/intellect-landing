/**
 * Статьи «Интеллекта»: content/blog/*.md → статичные страницы dist/blog/<slug>/ и список dist/blog/.
 *
 * Страницы без React и без JS: Яндекс и превью в мессенджерах видят готовый текст сразу. Шрифты и цвета
 * те же, что на сайте (стили — content/blog.css). Запускается в конце `npm run build` (и на Timeweb тоже):
 *   node scripts/blog.mjs          — страницы, список статей, карта сайта (адрес сайта из VITE_SITE_URL)
 *   node scripts/blog.mjs --og     — локально: ещё и картинки-превью в public/blog/<slug>/og.jpg (нужен Playwright),
 *                                    их коммитим — на хостинге Chrome нет
 *
 * Формат статьи: frontmatter (title, description, h1, lead, date, по желанию updated и service: okleyka|tonirovka|avtozapusk) и markdown.
 * Свои блоки: «::: stats» (строки «число | подпись | сравнение») и «::: cta» (запись: кнопка услуги, телефон, Telegram, Max).
 * Раздел «## Частые вопросы» с подзаголовками ### становится разметкой FAQPage.
 */
import { existsSync } from 'node:fs'
import { copyFile, mkdir, readFile, readdir, unlink, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const root = new URL('../', import.meta.url).pathname
const dist = join(root, 'dist')
const src = join(root, 'content/blog')
const SITE = (process.env.VITE_SITE_URL ?? '').replace(/\/$/, '')
const METRIKA = 112879449
const TG = 'MirWeba'
const MAX = 'https://max.ru/u/f9LHodD0cOJjxTRx-z3mN-F4waZeqClPehBT_uOx9VixL4gyIbEiJClEP3M'
const PREFILL = 'Здравствуйте! Я с сайта Intellect. '
const PHONE = '+79334170016'
const PHONE_LABEL = '+7 933 417-00-16'
const STUDIO = 'Автостудия «Интеллект»'
const OG_MODE = process.argv.includes('--og')
/** Куда ведёт главная кнопка в блоке записи: страница услуги и якорь формы или конструктора */
const SERVICES = {
  okleyka: { name: 'Оклейка полиуретаном', href: '/okleyka.html#constructor', label: 'Рассчитать оклейку' },
  tonirovka: { name: 'Тонировка', href: '/tonirovka.html#contact', label: 'Записаться на тонировку' },
  avtozapusk: { name: 'Сигнализация с автозапуском', href: '/avtozapusk.html#contact', label: 'Записаться на установку' },
}

if (!existsSync(join(dist, 'index.html'))) throw new Error('blog: сначала сборка (нет dist/index.html)')

// ── Типографика и разметка строк ─────────────────────────────────────────────────

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
/** Как nb() в src/lib/typo.tsx: короткие слова не висят в конце строки, тире не начинает строку */
const SHORT = 'в|во|на|с|со|за|и|а|но|от|по|к|ко|у|о|об|до|для|без|не|ни|из|при|под'
const nb = (s) =>
  s
    .replace(new RegExp(`(?<=^|[\\s«(„"])(${SHORT}) `, 'giu'), '$1 ')
    .replace(/ —/g, ' —')
    .replace(/(\d) (?=[\p{L}%₽])/gu, '$1 ')
    // Разряды числа не разрываются переносом: «12 000», «1 106»
    .replace(/(\d) (?=\d{3}(?!\d))/g, '$1 ')

const MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']
const ruDate = (iso) => {
  const [y, m, d] = iso.split('-').map(Number)
  return `${d} ${MONTHS[m - 1]} ${y}`
}
const TR = { а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'j', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'c', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya' }
const anchor = (s) =>
  s
    .toLowerCase()
    .split('')
    .map((c) => TR[c] ?? c)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60)

/** Строка markdown → HTML: жирный, курсив, ссылки. Сначала экранируем, потом размечаем */
function inline(md) {
  const links = []
  let s = md.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, text, url) => {
    links.push({ text, url })
    return `\uE000${links.length - 1}\uE000`
  })
  s = esc(nb(s))
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>')
  return s.replace(/\uE000(\d+)\uE000/g, (_, i) => {
    const { text, url } = links[i]
    const out = /^https?:\/\//.test(url) && !(SITE && url.startsWith(SITE))
    return `<a href="${esc(url)}"${out ? ' target="_blank" rel="noopener"' : ''}>${esc(nb(text))}</a>`
  })
}
const plain = (md) => md.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\*\*?/g, '')

// ── Markdown статьи → HTML ───────────────────────────────────────────────────────

function frontmatter(raw, file) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n/)
  if (!m) throw new Error(`blog: нет frontmatter в ${file}`)
  const meta = {}
  for (const line of m[1].split('\n')) {
    const i = line.indexOf(':')
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim()
  }
  for (const k of ['title', 'description', 'h1', 'lead', 'date']) if (!meta[k]) throw new Error(`blog: в ${file} нет поля ${k}`)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(meta.date)) throw new Error(`blog: дата в ${file} не в формате ГГГГ-ММ-ДД`)
  return { meta, body: raw.slice(m[0].length) }
}

function render(body, ctx) {
  const lines = body.split('\n')
  const out = []
  const toc = []
  const faq = []
  const stats = []
  let section = ''
  let i = 0
  const para = []
  const flush = () => {
    if (para.length) out.push(`<p>${inline(para.join(' '))}</p>`)
    para.length = 0
  }
  while (i < lines.length) {
    const line = lines[i]
    const t = line.trim()
    if (!t) {
      flush()
      i++
      continue
    }
    if (t.startsWith(':::')) {
      flush()
      const kind = t.slice(3).trim()
      const inner = []
      i++
      while (i < lines.length && lines[i].trim() !== ':::') inner.push(lines[i++])
      i++
      if (kind === 'stats') {
        const cards = inner
          .filter((l) => l.trim())
          .map((l) => {
            const [num, label, cmp] = l.split('|').map((x) => x.trim())
            stats.push({ num, label: plain(label) })
            return `<div class="stat"><b>${esc(nb(num))}</b><span>${inline(label)}</span>${cmp ? `<small>${inline(cmp)}</small>` : ''}</div>`
          })
        out.push(`<div class="stats">${cards.join('')}</div>`)
      } else if (kind === 'cta') {
        out.push(cta(ctx))
      } else throw new Error(`blog: неизвестный блок «::: ${kind}»`)
      continue
    }
    const h = t.match(/^(#{2,3}) (.+)$/)
    if (h) {
      flush()
      const text = h[2]
      const id = anchor(plain(text))
      if (h[1] === '##') {
        section = text
        toc.push({ id, text })
        out.push(`<h2 id="${id}">${inline(text)}</h2>`)
      } else {
        out.push(`<h3 id="${id}">${inline(text)}</h3>`)
        if (/частые вопросы/i.test(section)) faq.push({ q: plain(text), a: [] })
      }
      i++
      continue
    }
    if (/^([-*]|\d+\.) /.test(t)) {
      flush()
      const ordered = /^\d+\./.test(t)
      const items = []
      while (i < lines.length && /^([-*]|\d+\.) /.test(lines[i].trim())) items.push(lines[i++].trim().replace(/^([-*]|\d+\.) /, ''))
      const tag = ordered ? 'ol' : 'ul'
      out.push(`<${tag}>${items.map((x) => `<li>${inline(x)}</li>`).join('')}</${tag}>`)
      if (faq.length && /частые вопросы/i.test(section)) faq.at(-1).a.push(items.map(plain).join('; '))
      continue
    }
    if (t.startsWith('|')) {
      flush()
      const rows = []
      while (i < lines.length && lines[i].trim().startsWith('|')) rows.push(lines[i++].trim())
      const cells = (r) => r.replace(/^\||\|$/g, '').split('|').map((c) => c.trim())
      const [head, , ...rest] = rows
      out.push(
        `<div class="table" role="region" aria-label="Таблица" tabindex="0"><table><thead><tr>${cells(head)
          .map((c) => `<th>${inline(c)}</th>`)
          .join('')}</tr></thead><tbody>${rest.map((r) => `<tr>${cells(r).map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`,
      )
      continue
    }
    if (t.startsWith('> ')) {
      flush()
      const q = []
      while (i < lines.length && lines[i].trim().startsWith('> ')) q.push(lines[i++].trim().slice(2))
      out.push(`<blockquote><p>${inline(q.join(' '))}</p></blockquote>`)
      continue
    }
    para.push(t)
    if (faq.length && /частые вопросы/i.test(section)) faq.at(-1).a.push(plain(t))
    i++
  }
  flush()
  return { html: out.join('\n'), toc, stats, faq: faq.map((f) => ({ q: f.q, a: f.a.join(' ') })) }
}

// ── Куски страницы ───────────────────────────────────────────────────────────────

const LOGO = `<span class="logo__mark">intellect</span><span class="logo__dot" aria-hidden="true"></span>`
const tg = (text) => `https://t.me/${TG}?text=${encodeURIComponent(text)}`
/** Цели те же, что на сайте: phone, messenger (с параметром where, чтобы отличать статьи) */
const goal = (name, where) => `onclick="window.ym&&ym(${METRIKA},'reachGoal','${name}',{where:'${where}'})"`

function cta(ctx) {
  const s = SERVICES[ctx.service] ?? SERVICES.okleyka
  return `<section class="cta" aria-labelledby="cta-${ctx.n}">
  <h2 id="cta-${ctx.n}">${esc(nb('Запишитесь на осмотр'))}</h2>
  <p>${esc(nb('Посмотрим машину, назовём точную цену и срок. Свой бокс на Переходникова, 27Г, у метро «Автозаводская», по будням с 10:00 до 18:00'))}</p>
  <div class="cta-actions">
    <a class="btn btn--accent" href="${s.href}">${esc(s.label)}</a>
    <a class="btn nw" href="tel:${PHONE}" ${goal('phone', 'blog')}>${PHONE_LABEL}</a>
    <a class="btn" href="${esc(tg(`${PREFILL}Хочу записаться: ${s.name.toLowerCase()}`))}" target="_blank" rel="noopener" ${goal('messenger', 'blog')}>Telegram</a>
    <a class="btn" href="${MAX}" target="_blank" rel="noopener" ${goal('messenger', 'blog')}>Max</a>
  </div>
</section>`
}

const metrika = `<script>
      if (location.hostname === 'intellectdetailing.ru' || location.hostname === 'www.intellectdetailing.ru') {
        (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=${METRIKA}', 'ym');
        ym(${METRIKA}, 'init', {ssr:true, webvisor:true, clickmap:true, referrer: document.referrer, url: location.href, accurateTrackBounce:true, trackLinks:true});
      }
    </script>`

function head({ title, description, path, type, ld, image = '/og.jpg' }) {
  const url = SITE ? `${SITE}${path}` : ''
  return `<!doctype html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}" />
    <meta name="theme-color" content="#141414" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="preload" href="/blog/assets/unbounded-700-cyrillic.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="preload" href="/blog/assets/onest-400-cyrillic.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="stylesheet" href="/blog/assets/blog.css" />${url ? `\n    <link rel="canonical" href="${url}" />` : ''}
    <meta property="og:type" content="${type}" />
    <meta property="og:locale" content="ru_RU" />
    <meta property="og:site_name" content="Интеллект — детейлинг в Нижнем Новгороде" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(description)}" />${
      url
        ? `\n    <meta property="og:url" content="${url}" />\n    <meta property="og:image" content="${SITE}${image}" />\n    <meta property="og:image:width" content="1200" />\n    <meta property="og:image:height" content="630" />`
        : ''
    }
    <meta name="twitter:card" content="summary_large_image" />
${ld.map((x) => `    <script type="application/ld+json">${JSON.stringify(x)}</script>`).join('\n')}
    ${metrika}
  </head>`
}

function top(current) {
  return `<header class="top">
      <div class="top-in">
        <a class="logo" href="/" aria-label="«Интеллект» — на главную">${LOGO}</a>
        <nav class="links" aria-label="Услуги и статьи">
          <a href="/okleyka.html">Оклейка</a><a href="/tonirovka.html">Тонировка</a><a href="/avtozapusk.html">Автозапуск</a><a href="/blog/"${current ? ' aria-current="page"' : ''}>Статьи</a>
        </nav>
        <a class="phone nw" href="tel:${PHONE}" ${goal('phone', 'blog_header')}>${PHONE_LABEL}</a>
      </div>
    </header>`
}

function foot() {
  const year = new Date().getFullYear()
  return `<footer class="foot">
      <div class="foot-in">
        <a class="logo" href="/" aria-label="«Интеллект» — на главную">${LOGO}</a>
        <nav class="foot-links" aria-label="Услуги"><a href="/okleyka.html">Оклейка авто плёнкой</a><a href="/tonirovka.html">Тонировка</a><a href="/avtozapusk.html">Автозапуск</a><a href="/blog/">Статьи</a></nav>
        <span>Шашков Илья Николаевич, самозанятый · Нижний Новгород, ул. Переходникова, 27Г</span>
        <span><a class="nw" href="tel:${PHONE}" ${goal('phone', 'blog_footer')}>${PHONE_LABEL}</a> · <a href="https://vk.com/intellectdetailing" target="_blank" rel="noopener">ВКонтакте</a></span>
        <a class="legal" href="/privacy.html">Политика конфиденциальности</a>
        <span>© ${year} Автостудия «Интеллект» (Intellect)</span>
      </div>
    </footer>`
}

const ORG = { '@type': 'AutoRepair', name: 'Интеллект', alternateName: 'Intellect', ...(SITE ? { url: `${SITE}/`, image: `${SITE}/og.jpg` } : {}),
  telephone: PHONE_LABEL, address: { '@type': 'PostalAddress', streetAddress: 'ул. Переходникова, 27Г', addressLocality: 'Нижний Новгород', addressCountry: 'RU' } }

// ── Сборка ───────────────────────────────────────────────────────────────────────

const files = (await readdir(src)).filter((f) => f.endsWith('.md')).sort()
const posts = []
for (const [n, f] of files.entries()) {
  const slug = f.replace(/\.md$/, '')
  if (!/^[a-z0-9-]{3,80}$/.test(slug)) throw new Error(`blog: имя файла ${f} — только латиница, цифры и дефис`)
  const { meta, body } = frontmatter(await readFile(join(src, f), 'utf8'), f)
  if (meta.service && !SERVICES[meta.service]) throw new Error(`blog: в ${f} неизвестная услуга service: ${meta.service}`)
  const ctx = { n, h1: meta.h1, service: meta.service || 'okleyka' }
  const { html, toc, faq, stats } = render(body, ctx)
  const words = plain(body).split(/\s+/).filter(Boolean).length
  posts.push({ slug, meta, html, toc, faq, stats, minutes: Math.max(1, Math.round(words / 180)) })
}
posts.sort((a, b) => b.meta.date.localeCompare(a.meta.date) || a.slug.localeCompare(b.slug))

await mkdir(join(dist, 'blog/assets'), { recursive: true })
await copyFile(join(root, 'content/blog.css'), join(dist, 'blog/assets/blog.css'))
const fontsDir = join(root, 'src/assets/fonts')
for (const f of ['unbounded-700-cyrillic', 'unbounded-700-latin', 'onest-400-cyrillic', 'onest-400-latin', 'onest-500-cyrillic', 'onest-500-latin', 'onest-600-cyrillic', 'onest-600-latin']) {
  await copyFile(join(fontsDir, `${f}.woff2`), join(dist, 'blog/assets', `${f}.woff2`))
}

for (const p of posts) {
  const path = `/blog/${p.slug}/`
  const updated = p.meta.updated || p.meta.date
  const crumbs = [
    { name: 'Главная', path: '/' },
    { name: 'Статьи', path: '/blog/' },
    { name: p.meta.h1, path },
  ]
  const ld = [
    {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: p.meta.h1,
      description: p.meta.description,
      datePublished: p.meta.date,
      dateModified: updated,
      inLanguage: 'ru',
      author: ORG,
      publisher: ORG,
      ...(SITE ? { mainEntityOfPage: `${SITE}${path}`, image: `${SITE}${path}og.jpg` } : {}),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, ...(SITE ? { item: `${SITE}${c.path}` } : {}) })),
    },
    ...(p.faq.length
      ? [
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: p.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
          },
        ]
      : []),
  ]
  const others = posts.filter((x) => x !== p).slice(0, 3)
  const page = `${head({ title: `${p.meta.title} | Интеллект`, description: p.meta.description, path, type: 'article', ld, image: `${path}og.jpg` })}
  <body>
    ${top(false)}
    <main class="wrap">
      <ol class="crumbs"><li><a href="/">Главная</a></li><li><a href="/blog/">Статьи</a></li></ol>
      <article>
        <h1>${esc(nb(p.meta.h1))}</h1>
        <p class="lead">${esc(nb(p.meta.lead))}</p>
        <div class="meta"><b>${STUDIO}</b><span><time datetime="${p.meta.date}">${ruDate(p.meta.date)}</time> · ${p.minutes}&nbsp;мин чтения</span></div>
        ${p.toc.length > 3 ? `<nav class="toc" aria-label="Содержание"><p>Содержание</p><ol>${p.toc.map((t) => `<li><a href="#${t.id}">${inline(t.text)}</a></li>`).join('')}</ol></nav>` : ''}
        <div class="body">
${p.html}
        </div>
        <div class="author"><b>${STUDIO}, Нижний Новгород</b><p>${esc(nb('Оклейка полиуретаном, тонировка, сигнализации с автозапуском и антихром в своём боксе у метро «Автозаводская». Вопрос по статье можно задать по телефону или в'))} <a href="${esc(tg(`${PREFILL}Вопрос по статье «${p.meta.h1}»: `))}" target="_blank" rel="noopener" ${goal('messenger', 'blog_author')}>Telegram</a></p></div>
        ${updated !== p.meta.date ? `<p class="updated">Обновлено ${ruDate(updated)}</p>` : ''}
      </article>
      ${others.length ? `<section class="more"><h2>Ещё статьи</h2><div class="cards">${others.map(card).join('')}</div></section>` : ''}
    </main>
    ${foot()}
  </body>
</html>
`
  await mkdir(join(dist, 'blog', p.slug), { recursive: true })
  await writeFile(join(dist, 'blog', p.slug, 'index.html'), page)
}

function card(p) {
  return `<a class="card" href="/blog/${p.slug}/"><h2>${esc(nb(p.meta.h1))}</h2><p>${esc(nb(p.meta.description))}</p><small>${ruDate(p.meta.date)} · ${p.minutes}&nbsp;мин чтения</small></a>`
}

const indexLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Статьи автостудии «Интеллект»',
    inLanguage: 'ru',
    publisher: ORG,
    ...(SITE ? { url: `${SITE}/blog/` } : {}),
    blogPost: posts.map((p) => ({ '@type': 'BlogPosting', headline: p.meta.h1, datePublished: p.meta.date, ...(SITE ? { url: `${SITE}/blog/${p.slug}/` } : {}) })),
  },
]
await writeFile(
  join(dist, 'blog/index.html'),
  `${head({ title: 'Статьи об оклейке, тонировке и автозапуске | Интеллект', description: 'Как выбрать плёнку и тонировку, что разрешено законом, какую сигнализацию с автозапуском поставить и сколько это стоит. Статьи автостудии «Интеллект», Нижний Новгород', path: '/blog/', type: 'website', ld: indexLd })}
  <body>
    ${top(true)}
    <main class="wrap">
      <ol class="crumbs"><li><a href="/">Главная</a></li></ol>
      <h1>Статьи</h1>
      <p class="lead">${esc(nb('Разбираем, как выбрать плёнку, тонировку и сигнализацию с автозапуском, что разрешено законом и сколько это стоит в Нижнем Новгороде'))}</p>
      <div class="cards">${posts.map(card).join('')}</div>
    </main>
    ${foot()}
  </body>
</html>
`,
)

// ── Картинка превью статьи: 1200×630 в стиле сайта. Рисуется только локально (--og) и коммитится в public/ ──
async function ogImages() {
  const { chromium } = await import('/Users/andrew/.local/lib/node_modules/playwright/index.mjs')
  const fonts = `file://${join(dist, 'blog/assets')}/`
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })
  for (const p of posts) {
    const tmp = join(dist, 'blog', p.slug, 'og.html')
    const len = p.meta.h1.length
    const size = len > 80 ? 44 : len > 55 ? 50 : 58
    await writeFile(
      tmp,
      `<!doctype html><html lang="ru"><head><meta charset="UTF-8" /><style>
@font-face { font-family: 'Unbounded'; src: url('${fonts}unbounded-700-cyrillic.woff2') format('woff2'); font-weight: 700; unicode-range: U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116; }
@font-face { font-family: 'Unbounded'; src: url('${fonts}unbounded-700-latin.woff2') format('woff2'); font-weight: 700; unicode-range: U+0000-00FF, U+2000-206F, U+20BD; }
@font-face { font-family: 'Onest'; src: url('${fonts}onest-500-cyrillic.woff2') format('woff2'); font-weight: 500; unicode-range: U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116; }
@font-face { font-family: 'Onest'; src: url('${fonts}onest-500-latin.woff2') format('woff2'); font-weight: 500; unicode-range: U+0000-00FF, U+2000-206F, U+20BD; }
* { box-sizing: border-box; margin: 0; }
html, body { width: 1200px; height: 630px; overflow: hidden; background: #141414; color: #f4f4f4; font-family: 'Onest', sans-serif; -webkit-font-smoothing: antialiased; }
body::before { content: ''; position: absolute; inset: 0; background: radial-gradient(60% 80% at 100% 0%, rgba(46,200,198,.18), transparent 70%); }
.top { position: absolute; left: 64px; right: 64px; top: 52px; display: flex; align-items: center; justify-content: space-between; }
.logo { display: inline-flex; align-items: baseline; gap: 8px; font: 700 34px/1 'Unbounded'; }
.logo__mark { position: relative; padding: 5px 8px; }
.logo__mark::before, .logo__mark::after { content: ''; position: absolute; width: 12px; height: 12px; border: 3px solid #fff; }
.logo__mark::before { left: -3px; top: -3px; border-right: 0; border-bottom: 0; }
.logo__mark::after { right: -3px; bottom: -3px; border-left: 0; border-top: 0; }
.logo__dot { width: 10px; height: 10px; background: #2ec8c6; }
.tag { font-size: 22px; color: #a9a9a9; }
h1 { position: absolute; left: 64px; right: 64px; top: 150px; font: 700 ${size}px/1.12 'Unbounded'; letter-spacing: -0.01em; text-wrap: balance; }
.stats { position: absolute; left: 64px; right: 64px; bottom: 52px; display: flex; gap: 14px; }
.stat { flex: 1; padding: 20px 22px; border-radius: 16px; background: #1f1f1f; border: 1px solid #303030; }
.stat b { display: block; font: 700 34px/1 'Unbounded'; color: #2ec8c6; }
.stat span { display: block; margin-top: 10px; font-size: 19px; line-height: 1.3; color: #a9a9a9; }
</style></head><body>
<div class="top"><div class="logo">${LOGO}</div><div class="tag">Статьи · intellectdetailing.ru</div></div>
<h1>${esc(nb(p.meta.h1))}</h1>
${p.stats.length ? `<div class="stats">${p.stats.slice(0, 3).map((s) => `<div class="stat"><b>${esc(nb(s.num))}</b><span>${esc(nb(s.label))}</span></div>`).join('')}</div>` : ''}
</body></html>`,
    )
    await page.goto(`file://${tmp}`, { waitUntil: 'load' })
    const missing = await page.evaluate(async () => {
      await document.fonts.ready
      return ['700 50px Unbounded', '500 20px Onest'].filter((f) => !document.fonts.check(f, 'Плёнка'))
    })
    if (missing.length) throw new Error(`blog: в превью ${p.slug} не загрузились шрифты: ${missing.join(', ')}`)
    const overlap = await page.evaluate(() => {
      const h = document.querySelector('h1').getBoundingClientRect()
      const s = document.querySelector('.stats')?.getBoundingClientRect()
      return s ? h.bottom > s.top - 16 : h.bottom > 600
    })
    if (overlap) throw new Error(`blog: в превью ${p.slug} заголовок не помещается — сократите h1`)
    await mkdir(join(root, 'public/blog', p.slug), { recursive: true })
    await page.screenshot({ path: join(root, 'public/blog', p.slug, 'og.jpg'), type: 'jpeg', quality: 85 })
    await copyFile(join(root, 'public/blog', p.slug, 'og.jpg'), join(dist, 'blog', p.slug, 'og.jpg'))
    await unlink(tmp)
  }
  await browser.close()
}
if (OG_MODE) await ogImages()
// На хостинге превью уже лежит в dist (vite скопировал public/blog/<slug>/og.jpg); если нет — общая картинка сайта
for (const p of posts) {
  if (!existsSync(join(dist, 'blog', p.slug, 'og.jpg'))) await copyFile(join(dist, 'og.jpg'), join(dist, 'blog', p.slug, 'og.jpg'))
}

// Карта сайта: дописываем раздел к той, что собрал vite.config.ts (повторный запуск не дублирует строки)
const sitemap = join(dist, 'sitemap.xml')
if (SITE && existsSync(sitemap)) {
  const urls = [
    `  <url><loc>${SITE}/blog/</loc><lastmod>${posts[0]?.meta.updated || posts[0]?.meta.date}</lastmod><priority>0.6</priority></url>`,
    ...posts.map((p) => `  <url><loc>${SITE}/blog/${p.slug}/</loc><lastmod>${p.meta.updated || p.meta.date}</lastmod><priority>0.5</priority></url>`),
  ].join('\n')
  const xml = (await readFile(sitemap, 'utf8')).split('\n').filter((l) => !l.includes(`${SITE}/blog/`)).join('\n')
  await writeFile(sitemap, xml.replace('</urlset>', `${urls}\n</urlset>`))
}
console.log(`blog: статей ${posts.length}${SITE ? ', карта сайта дополнена' : ' (без VITE_SITE_URL: без canonical и карты сайта)'}${OG_MODE ? ', превью нарисованы' : ''}`)
