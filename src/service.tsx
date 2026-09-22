import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/fonts.css'
import '@/styles.css'
import { ServicePage } from '@/ServicePage'
import { initMetrika } from '@/lib/metrika'

initMetrika()

// страница услуги определяется мета-тегом, который пишет scripts/gen-pages.mjs
const slug = document.querySelector('meta[name="page-slug"]')?.getAttribute('content')
  ?? location.pathname.split('/').pop()?.replace(/\.html$/, '') ?? ''

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ServicePage slug={slug} />
  </StrictMode>,
)
