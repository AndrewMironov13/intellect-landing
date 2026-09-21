import { faq } from '@/content'
import { Reveal } from './Reveal'

export function Faq() {
  return (
    <section className="section" id="faq" aria-labelledby="faq-title" style={{ paddingTop: 0 }}>
      <div className="container" style={{ maxWidth: 860 }}>
        <Reveal>
          <p className="eyebrow">Вопросы и ответы</p>
          <h2 className="h2" id="faq-title" style={{ marginTop: 16, marginBottom: 28 }}>Про оклейку, тонировку и автозапуск</h2>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="faq">
            {faq.map((f) => (
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
