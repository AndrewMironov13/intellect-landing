# Автостудия Intellect — сайт

Vite + React 19 + TypeScript, анимации `motion/react` (не framer-motion), иконки lucide.
Стили — один файл `src/styles.css` с токенами. Весь текст, цены, контакты — `src/content.ts`.

## Выкладка на Timeweb Cloud App Platform (боевой домен)

- Тип Frontend, команда `npm run build`, **каталог сборки `dist`** (пресет React подставляет `build` — ловушка), Node 24.
- Переменные окружения: `VITE_SITE_URL=https://домен` и больше ничего (`VITE_BASE`/`VITE_NOINDEX` — только для демо на GitHub Pages).
- Chrome на хостинге не нужен: пререндер лежит в репозитории (`prerender/root.html`, base-путь заменён токеном
  `__BASE__`), vite-плагин вшивает его в `index.html`. **После любой правки контента запускать локально
  `npm run prerender` и коммитить обновлённый `prerender/root.html`**, иначе краулеры без JS увидят старый текст.
- `.env.example` — образец переменных.

## Где живёт

- Исходники: https://github.com/AndrewMironov13/intellect-landing (ветка `main`)
- **Боевой сайт: https://intellectdetailing.ru** (Timeweb App Platform, app_id 257841 «Cute Grosbeak», аккаунт Андрея ms081097, IP 178.209.127.53). Репозиторий подключён по URL, автодеплоя нет.
- **Деплой после push:** `source ~/.zshrc && scripts/deploy.sh` (MCP Timeweb, токен `TIMEWEB_TOKEN` в ~/.zshrc). В Claude Code тот же MCP зарегистрирован как `timeweb-cloud` (user scope), инструменты `search_tools` → `get_tool_definition` → `execute_tool`, tool_id `create_app_deploy` / `list_app_deploys` / `get_app_deploy_logs`, полный 40-символьный SHA, два шага с confirm_token.
- Демо на GitHub Pages заменено редиректом на боевой домен (ветка `gh-pages`)

Выкладка демо:

```bash
VITE_BASE=/intellect-landing VITE_SITE_URL=https://andrewmironov13.github.io VITE_NOINDEX=1 npm run build
cd dist && touch .nojekyll && git init && git add -A && git commit -m deploy \
  && git -c http.postBuffer=524288000 push -f https://github.com/AndrewMironov13/intellect-landing.git HEAD:gh-pages && rm -rf .git
```

`VITE_NOINDEX=1` = абсолютные og-ссылки для превью в мессенджерах, но `noindex` и `Disallow` (демо не индексируется).
Без буфера пуш dist падал с HTTP 400.

## Запуск

```bash
npm run dev        # http://127.0.0.1:5198
npm run build      # tsc + vite build + пререндер (scripts/prerender.py, нужен Chrome и python websockets)
npm run build:nopre   # без пререндера
```

Переменные сборки: `VITE_SITE_URL=https://домен` включает canonical, og:url, абсолютный og:image,
robots.txt с Allow и sitemap.xml. Без неё robots.txt = `Disallow: /` (демо-копия не индексируется).
`VITE_BASE=/repo` для GitHub Pages.

## SEO-архитектура (21.09.2026)

- **Страницы услуг** `okleyka.html`, `tonirovka.html`, `avtozapusk.html` генерируются из `servicePages` в
  `src/content.ts` скриптом `scripts/gen-pages.mjs` (Node 24 читает TS сам). Статический HTML, без React:
  H1 с городом, интро, «что делаем», цены, шаги, 2 отзыва, FAQ, CTA на главную `#contact`. В .gitignore.
- **Метатеги** главной — `seo` в content.ts (title 66, description с ценами и рейтингом, keywords по
  подсказкам Яндекса для lr=47, гео Автозаводского района). Плагин `intellect-seo` в `vite.config.ts`
  подставляет их в `__TITLE__`/`__DESC__` и добавляет canonical/og:url/geo/JSON-LD на каждую страницу.
- **JSON-LD** одним `@graph`: главная — AutoRepair+LocalBusiness (адрес, гео, часы, рейтинг, 3 отзыва,
  каталог услуг с ценами) + FAQPage; страницы услуг — Service + FAQPage + BreadcrumbList + бизнес.
- **FAQ** на главной (`Faq.tsx`, 6 вопросов из `faq`) и по 4 на каждой странице услуги.
- **Перелинковка:** карточки услуг → «Подробнее об услуге», лид услуг, футер, между страницами услуг.
- **robots/sitemap** — все 5 страниц с lastmod и priority, только при `VITE_SITE_URL` без `VITE_NOINDEX`.
- Значок «Рейтинг 4,8 · N отзывов об услугах» в сниппете Яндекса даёт НЕ разметка, а привязка сайта к
  карточке Яндекс Бизнеса — сделать в день домена.

## SEO (18.09.2026)

- Пререндер: после сборки `scripts/prerender.py` открывает dist в headless Chrome с prefers-reduced-motion
  и вшивает отрендеренный `#root` в `dist/index.html` → краулер без JS видит ~950 слов, все картинки, H1–H3.
  Для живых пользователей hero спрятан правилом `html.js [data-prerender] .hero`, пока React не смонтируется.
- `vite.config.ts` → плагин `intellect-seo`: preload hero-фото, og:image, twitter:card, JSON-LD
  (AutoRepair + LocalBusiness, адрес, часы, каталог услуг с ценами из content.ts, рейтинг), canonical/robots/sitemap.
- Шрифты локально (`src/fonts.css`, `src/assets/fonts/*.woff2`), Google Fonts не запрашивается.
- Блок «О студии» (`About.tsx`) с текстом заказчика с clients.site и ключевыми услугами.
- Отладочная ручка `?hero=genesis|lexus` подменяет фото первого экрана.

Превью из Claude: конфиг `intellect` в `~/Claude/.claude/launch.json` (порт 5198).

## Дизайн

- Референс формы: detailingtiptop.ru (тёмный фон, тонкие крупные заголовки, пилюли). Токены сняты computed styles.
- Бирюзовый `#2EC8C6` — цвет надписи INTELLECT на воротах бокса.
- Шрифты: Unbounded (дисплей, совпадает с жирным логотипом на стене) + Onest (текст). Оба с кириллицей, Google Fonts.
- Подпись: сотовый свет бокса. Hero — canvas-решётка шестиугольников, зажигается волной при загрузке и светится под курсором (`HexLattice.tsx`). Один canvas, рисует только пока что-то меняется.
- Секции: hero → бегущая строка услуг → 3 главные услуги + прайс → зима/автозапуск (счётчик −18° → +22°) → конструктор оклейки → работы (лайтбокс) → отзывы → запись + карта → футер.

## Чеклист дня домена

1. `VITE_SITE_URL=https://домен` (без `VITE_NOINDEX`) → сборка даёт canonical, robots Allow, sitemap.
2. Яндекс Вебмастер: подтвердить права (мета-тег в `index.html`), регион «Нижний Новгород», отдать sitemap.
3. Яндекс Бизнес: в карточке заменить визитку clients.site на сайт — оттуда рейтинг в сниппет.
4. Метрика: номер счётчика в `metrika.id` (content.ts), проверить цели phone/form/calc/messenger/map.
5. Google Search Console — по желанию, тот же sitemap.
6. Демо на GitHub Pages заменить редиректом на домен.

## Что не подтверждено заказчиком (см. `PRICE_UNCONFIRMED` в content.ts)

- Цены конструктора: капот 15 000, фары 4 000, бампер от 16 000, зеркала 4 500, кузов 240 000 — с витрины Яндекса и новости от 08.06.2024.
- Автозапуск: цены нет, стоит «сигнализация от 25 000, автозапуск — после осмотра».
- График Пн–Пт 10–18 (Яндекс) против «ежедневно 9–20» на старой визитке.
- Плёнки Spectroll / NAR не упоминаем, пока Илья не подтвердит.

## Форма

`contact.endpoint` пустой: заявка логируется в консоль и показывает экран успеха. Когда будет почта — `https://formsubmit.co/ajax/<почта>`, владелец подтверждает адрес по первому письму.

## Ассеты

`public/photos/*.webp` — 8 фото с Яндекс Карт (960×1280, `-s` — превью 675×900). Ждём от Ильи фото BMW 530d / Lexus RX300, логотип, видео из бокса.
