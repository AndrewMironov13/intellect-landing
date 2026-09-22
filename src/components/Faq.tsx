import { faq as homeFaq, type Faq as FaqItem } from '@/content'
import { Reveal } from './Reveal'

export function Faq({ items = homeFaq, title = 'Про оклейку, тонировку и автозапуск' }: { items?: FaqItem[]; title?: string }) {
  return (
    <section className="section" id="faq" aria-labelledby="faq-title" style={{ paddingTop: 0 }}>
      <div className="container" style={{ maxWidth: 860 }}>
        <Reveal>
          <p className="eyebrow">Вопросы и ответы</p>
          <h2 className="h2" id="faq-title" style={{ marginTop: 16, marginBottom: 28 }}>{title}</h2>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="faq">
            {items.map((f) => (
              <details className="faq__item" key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
