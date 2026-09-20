# Автостудия Intellect — сайт

Vite + React 19 + TypeScript, анимации `motion/react` (не framer-motion), иконки lucide.
Стили — один файл `src/styles.css` с токенами. Весь текст, цены, контакты — `src/content.ts`.

## Запуск

```bash
npm run dev        # http://127.0.0.1:5198
npm run build      # tsc + vite build + пререндер (scripts/prerender.py, нужен Chrome и python websockets)
npm run build:nopre   # без пререндера
```

Переменные сборки: `VITE_SITE_URL=https://домен` включает canonical, og:url, абсолютный og:image,
robots.txt с Allow и sitemap.xml. Без неё robots.txt = `Disallow: /` (демо-копия не индексируется).
`VITE_BASE=/repo` для GitHub Pages.

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

## Что не подтверждено заказчиком (см. `PRICE_UNCONFIRMED` в content.ts)

- Цены конструктора: капот 15 000, фары 4 000, бампер от 16 000, зеркала 4 500, кузов 240 000 — с витрины Яндекса и новости от 08.06.2024.
- Автозапуск: цены нет, стоит «сигнализация от 25 000, автозапуск — после осмотра».
- График Пн–Пт 10–18 (Яндекс) против «ежедневно 9–20» на старой визитке.
- Плёнки Spectroll / NAR не упоминаем, пока Илья не подтвердит.

## Форма

`contact.endpoint` пустой: заявка логируется в консоль и показывает экран успеха. Когда будет почта — `https://formsubmit.co/ajax/<почта>`, владелец подтверждает адрес по первому письму.

## Ассеты

`public/photos/*.webp` — 8 фото с Яндекс Карт (960×1280, `-s` — превью 675×900). Ждём от Ильи фото BMW 530d / Lexus RX300, логотип, видео из бокса.
