// HTML-оболочки страниц услуг: метатеги + точка входа React (src/service.tsx).
// Содержимое для поисковиков вшивается из prerender/<slug>.html (npm run prerender).
import { writeFileSync } from 'node:fs'
import { servicePages } from '../src/content.ts'

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')

for (const p of servicePages) {
  const html = `<!doctype html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${esc(p.title)}</title>
    <meta name="description" content="${esc(p.description)}" />
    <meta name="theme-color" content="#141414" />
    <script>document.documentElement.classList.add('js')</script>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Интеллект" />
    <meta property="og:title" content="${esc(p.h1)} — детейлинг «Интеллект»" />
    <meta property="og:description" content="${esc(p.lead)}" />
    <meta property="og:locale" content="ru_RU" />
    <meta name="page-slug" content="${p.slug}" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/service.tsx"></script>
  </body>
</html>
`
  writeFileSync(`${p.slug}.html`, html)
  console.log('page:', p.slug + '.html')
}
